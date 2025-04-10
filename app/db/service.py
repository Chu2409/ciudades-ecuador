from app.db.connection import Neo4jConnection
from app.geo.coords import GeoLocatorService


class CrudService:
    def __init__(self):
        self.connection = Neo4jConnection()
        self.geolocator = GeoLocatorService()

    def close(self):
        self.connection.close()

    def add_city(self, name, lat=None, lon=None):
        """Añadir una nueva ciudad al grafo"""
        if lat is None or lon is None:
            coords = self._get_coordinates(name)
            if coords:
                lat, lon = coords

        query = """
        MERGE (c:Ciudad {name: $name})
        SET c.latitude = $lat,
            c.longitude = $lon
        RETURN c
        """
        return self.connection.run_query(query, {"name": name, "lat": lat, "lon": lon})

    def add_connection(self, city1, city2, distance):
        """Añadir una conexión bidireccional entre dos ciudades"""
        if not self._city_exists(city1) or not self._city_exists(city2):
            raise ValueError(f"Una o ambas ciudades no existen: {city1}, {city2}")

        query = """
        MATCH (c1:Ciudad {name: $city1})
        MATCH (c2:Ciudad {name: $city2})
        MERGE (c1)-[r1:CONECTA_CON {distancia: $distance}]->(c2)
        MERGE (c2)-[r2:CONECTA_CON {distancia: $distance}]->(c1)
        RETURN r1, r2
        """
        return self.connection.run_query(
            query, {"city1": city1, "city2": city2, "distance": float(distance)}
        )

    def update_connection(self, city1, city2, new_distance):
        """Actualizar la distancia entre dos ciudades"""
        query = """
        MATCH (c1:Ciudad {name: $city1})-[r1:CONECTA_CON]->(c2:Ciudad {name: $city2})
        MATCH (c2)-[r2:CONECTA_CON]->(c1)
        SET r1.distancia = $distance,
            r2.distancia = $distance
        RETURN r1, r2
        """
        return self.connection.run_query(
            query, {"city1": city1, "city2": city2, "distance": float(new_distance)}
        )

    def delete_city(self, name):
        """Eliminar una ciudad y todas sus conexiones"""
        query = "MATCH (c:Ciudad {name: $name}) DETACH DELETE c"
        return self.connection.run_query(query, {"name": name})

    def delete_connection(self, city1, city2):
        """Eliminar la conexión entre dos ciudades"""
        query = """
        MATCH (c1:Ciudad {name: $city1})-[r1:CONECTA_CON]->(c2:Ciudad {name: $city2})
        MATCH (c2)-[r2:CONECTA_CON]->(c1)
        DELETE r1, r2
        """
        return self.connection.run_query(query, {"city1": city1, "city2": city2})

    def get_all_cities(self):
        """Obtener todas las ciudades"""
        query = """
        MATCH (c:Ciudad)
        RETURN c.name AS name, c.latitude AS lat, c.longitude AS lon
        ORDER BY c.name
        """
        result = self.connection.run_query(query)
        return [{"nombre": r["name"], "lat": r["lat"], "lon": r["lon"]} for r in result]

    def get_all_connections(self):
        """Obtener todas las conexiones únicas"""
        query = """
        MATCH (c1:Ciudad)-[r:CONECTA_CON]->(c2:Ciudad)
        WHERE id(c1) < id(c2)
        RETURN c1.name AS city1, c2.name AS city2, r.distancia AS distance
        ORDER BY c1.name, c2.name
        """
        result = self.connection.run_query(query)
        return [
            {"city1": r["city1"], "city2": r["city2"], "distance": r["distance"]}
            for r in result
        ]

    def _city_exists(self, name):
        """Verificar si una ciudad ya existe"""
        query = "MATCH (c:Ciudad {name: $name}) RETURN count(c) AS count"
        result = self.connection.run_query(query, {"name": name})
        return result[0]["count"] > 0

    def _get_coordinates(self, city_name, country="Ecuador"):
        return self.geolocator.get_city_coordinates(city_name, country)


# Ejemplo de uso
if __name__ == "__main__":
    graph = CrudService()

    # Ejemplos de operaciones
    try:
        # Añadir ciudades
        graph.add_city("Loja")
        graph.add_city("Riobamba")

        # Añadir conexión
        graph.add_connection("Loja", "Riobamba", 250.5)

        # Listar ciudades
        cities = graph.get_all_cities()
        print("Ciudades:")
        for city, lat, lon in cities:
            print(f"- {city}: ({lat}, {lon})")

        # Listar conexiones
        connections = graph.get_all_connections()
        print("\nConexiones:")
        for city1, city2, distance in connections:
            print(f"- {city1} <-> {city2}: {distance} km")

    finally:
        graph.close()
