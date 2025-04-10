import pandas as pd
import numpy as np
import logging
import os

from app.db.connection import Neo4jConnection
from app.geo.coords import GeoLocatorService

# Configurar logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger()


class ImporterService:
    def __init__(self):
        self.conn = Neo4jConnection()

    def close(self):
        self.conn.close()

    def process_csv_file(self, file_path):
        """Procesar el archivo CSV que contiene la matriz de distancias"""
        try:
            # Leer el archivo CSV
            df = pd.read_csv(file_path, index_col=0)

            # Verificar que la matriz sea simétrica
            if not all(df.index == df.columns):
                logger.warning(
                    "¡Las filas y columnas no coinciden! Esto podría no ser una matriz simétrica."
                )

            # Crear diccionario de ciudades y distancias
            cities = df.index.tolist()
            distances = {}

            for i in range(len(cities)):
                for j in range(
                    i + 1, len(cities)
                ):  # Solo la mitad superior (evita duplicados)
                    city1 = cities[i]
                    city2 = cities[j]
                    distance = df.iloc[i, j]

                    # Solo almacenar si hay una conexión (distancia no es NaN o 0)
                    if not np.isnan(distance) and distance > 0:
                        distances[(city1, city2)] = distance

            return cities, distances
        except Exception as e:
            logger.error(f"Error al procesar el archivo CSV: {e}")
            return None, None

    def import_to_neo4j(self, cities, distances):
        """Importar ciudades y distancias a Neo4j"""
        try:
            # 1. Crear nodos para las ciudades
            for city in cities:
                query = """
                MERGE (c:Ciudad {name: $name})
                RETURN c
                """
                self.conn.run_query(query, {"name": city})
            logger.info(f"Se crearon {len(cities)} nodos de ciudades")

            # 2. Crear relaciones de distancia
            relationship_count = 0
            for (city1, city2), distance in distances.items():
                query = """
                MATCH (c1:Ciudad {name: $city1})
                MATCH (c2:Ciudad {name: $city2})
                MERGE (c1)-[r:CONECTA_CON {distancia: $distance}]->(c2)
                MERGE (c2)-[r2:CONECTA_CON {distancia: $distance}]->(c1)
                RETURN r, r2
                """
                self.conn.run_query(
                    query, {"city1": city1, "city2": city2, "distance": distance}
                )
                relationship_count += 2  # Contamos ambas direcciones

            logger.info(f"Se crearon {relationship_count} relaciones de distancia")

            return True
        except Exception as e:
            logger.error(f"Error al importar datos a Neo4j: {e}")
            return False
        finally:
            self.conn.close()

    def add_city_coordinates(self, city_coordinates):
        """Actualizar nodos de ciudades con coordenadas geográficas"""
        try:
            for city, coords in city_coordinates.items():
                query = """
                MATCH (c:Ciudad {name: $name})
                SET c.latitude = $lat, c.longitude = $lon
                RETURN c
                """
                self.conn.run_query(
                    query, {"name": city, "lat": coords[0], "lon": coords[1]}
                )

            logger.info(
                f"Se actualizaron {len(city_coordinates)} ciudades con coordenadas"
            )
            return True
        except Exception as e:
            logger.error(f"Error al añadir coordenadas: {e}")
            return False
        finally:
            self.conn.close()

    def execute(self):
        # Ruta al archivo CSV (ajustar según la ubicación real)
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        csv_file = os.path.join(BASE_DIR, "data", "distancias.csv")

        # Procesar el archivo CSV
        cities, distances = self.process_csv_file(csv_file)

        if not cities or not distances:
            logger.error(
                "No se pudieron procesar los datos del CSV. Verifique el archivo y el formato."
            )
            return

        # Conectar a Neo4j
        conn = Neo4jConnection()
        conn.create_constraints()

        # Importar ciudades y relaciones
        if self.import_to_neo4j(cities, distances):
            logger.info("¡Importación de ciudades y conexiones completada!")

            # Obtener coordenadas geográficas
            geo_service = GeoLocatorService()
            city_coords = geo_service.get_all_city_coordinates(cities)

            # Añadir coordenadas a los nodos
            if self.add_city_coordinates(city_coords):
                logger.info("¡Coordenadas añadidas exitosamente!")
            else:
                logger.error("Error al añadir coordenadas.")
        else:
            logger.error("La importación de datos falló.")

        conn.close()
