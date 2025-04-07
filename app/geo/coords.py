from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
import time
import logging

logger = logging.getLogger(__name__)


class GeoLocatorService:
    def __init__(self, user_agent="uio_ia_project", delay=1):
        self.geolocator = Nominatim(user_agent=user_agent)
        self.delay = delay

    def get_city_coordinates(self, city_name, country="Ecuador"):
        """Obtener coordenadas geográficas para una ciudad usando OpenStreetMap"""
        try:
            query = f"{city_name}, {country}"
            location = self.geolocator.geocode(query)

            if location:
                return (location.latitude, location.longitude)
            else:
                logger.warning(f"No se encontraron coordenadas para {city_name}")
                return None

        except (GeocoderTimedOut, GeocoderUnavailable):
            logger.warning(
                f"Tiempo de espera agotado al buscar {city_name}. Reintentando..."
            )
            time.sleep(self.delay)
            return self.get_city_coordinates(city_name, country)  # Retry
        except Exception as e:
            logger.error(f"Error al obtener coordenadas para {city_name}: {e}")
            return None

    def get_all_city_coordinates(self, cities, country="Ecuador"):
        """Obtener coordenadas para una lista de ciudades"""
        coordinates = {}

        for city in cities:
            logger.info(f"Obteniendo coordenadas para {city}...")
            coords = self.get_city_coordinates(city, country)

            if coords:
                coordinates[city] = coords

            time.sleep(self.delay)  # Respetar límites de API

        return coordinates


# Ejemplo de uso:
if __name__ == "__main__":
    # Lista de ciudades de Ecuador
    ecuador_cities = ["Quito", "Guayaquil", "Cuenca", "Machala", "Ambato"]

    service = GeoLocatorService()

    # Obtener coordenadas
    coords = service.get_all_city_coordinates(ecuador_cities)

    # Imprimir resultados
    for city, (lat, lon) in coords.items():
        print(f"{city}: {lat}, {lon}")
