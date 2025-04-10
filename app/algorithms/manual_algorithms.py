import networkx as nx
from math import sqrt
from queue import PriorityQueue
from collections import defaultdict

from app.db.connection import Neo4jConnection
from app.services.visualizaer import VisualizerService


class ManualAlgoritmosService:
    def __init__(self):
        self.conn = Neo4jConnection()
        self.visualizer = VisualizerService()

    def construir_grafo(self):
        """
        Construye un grafo a partir de datos de Neo4j
        Retorna el grafo, posiciones para visualización y coordenadas
        """
        nodos_query = """
        MATCH (c:Ciudad)
        RETURN c.name AS name, c.latitude AS lat, c.longitude AS lon
        """
        relaciones_query = """
        MATCH (c1:Ciudad)-[r:CONECTA_CON]->(c2:Ciudad)
        WHERE id(c1) < id(c2)
        RETURN c1.name AS origen, c2.name AS destino, r.distancia AS distancia
        """

        nodos = self.conn.run_query(nodos_query)
        relaciones = self.conn.run_query(relaciones_query)

        # Construimos un grafo NetworkX solo para visualización
        G_visual = nx.Graph()
        posiciones = {}
        coords = {}

        # Estructura de datos para nuestro grafo
        grafo = defaultdict(dict)

        for nodo in nodos:
            nombre = nodo["name"]
            G_visual.add_node(nombre)
            posiciones[nombre] = (nodo["lon"], nodo["lat"])
            coords[nombre] = (nodo["lat"], nodo["lon"])
            grafo[nombre] = {}  # Inicializamos el diccionario de vecinos

        for r in relaciones:
            origen = r["origen"]
            destino = r["destino"]
            distancia = r["distancia"]

            # Añadimos la conexión a nuestro grafo (bidireccional)
            grafo[origen][destino] = distancia
            grafo[destino][origen] = distancia

            # Añadimos al grafo visual
            G_visual.add_edge(origen, destino, weight=distancia)

        return G_visual, posiciones, coords, grafo

    def heuristica(self, ciudad1, ciudad2, coords):
        """
        Calcula la distancia euclidiana entre dos ciudades como heurística
        """
        lat1, lon1 = coords[ciudad1]
        lat2, lon2 = coords[ciudad2]
        return sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2)

    def calcular_distancia_total(self, camino, grafo):
        """
        Calcula la distancia total de un camino
        """
        distancia = 0
        for i in range(len(camino) - 1):
            distancia += grafo[camino[i]][camino[i + 1]]
        return distancia

    def dijkstra_manual(self, grafo, origen, destino):
        """
        Implementación manual del algoritmo de Dijkstra
        """
        # Inicialización
        distancias = {ciudad: float("infinity") for ciudad in grafo}
        distancias[origen] = 0
        padres = {ciudad: None for ciudad in grafo}
        visitados = set()

        # Cola de prioridad para seleccionar el nodo con menor distancia
        cola = PriorityQueue()
        cola.put((0, origen))

        while not cola.empty():
            # Obtener ciudad con menor distancia acumulada
            dist_actual, ciudad_actual = cola.get()

            # Si llegamos al destino, reconstruimos el camino
            if ciudad_actual == destino:
                camino = []
                while ciudad_actual is not None:
                    camino.append(ciudad_actual)
                    ciudad_actual = padres[ciudad_actual]
                camino.reverse()  # El camino se construye del destino al origen
                return camino, distancias[destino]

            # Si ya procesamos esta ciudad, continuamos
            if ciudad_actual in visitados:
                continue

            # Marcar como visitada
            visitados.add(ciudad_actual)

            # Revisar todos los vecinos
            for vecino, peso in grafo[ciudad_actual].items():
                if vecino in visitados:
                    continue

                # Calcular nueva distancia
                distancia = dist_actual + peso

                # Si encontramos un camino más corto
                if distancia < distancias[vecino]:
                    distancias[vecino] = distancia
                    padres[vecino] = ciudad_actual
                    cola.put((distancia, vecino))

        # Si no hay camino al destino
        return None, float("infinity")

    def astar_manual(self, grafo, origen, destino, coords):
        """
        Implementación manual del algoritmo A*
        """
        # Cola de prioridad para seleccionar el nodo con menor f = g + h
        # donde g es el costo acumulado y h es la heurística
        cola = PriorityQueue()
        cola.put((0, origen))

        # Costo conocido desde el origen hasta cada nodo
        g_score = {ciudad: float("infinity") for ciudad in grafo}
        g_score[origen] = 0

        # Costo estimado desde el origen hasta el destino pasando por cada nodo
        f_score = {ciudad: float("infinity") for ciudad in grafo}
        f_score[origen] = self.heuristica(origen, destino, coords)

        # Para reconstruir el camino
        padres = {ciudad: None for ciudad in grafo}

        # Conjunto de nodos ya evaluados
        visitados = set()

        while not cola.empty():
            # Obtener nodo con menor f_score
            _, ciudad_actual = cola.get()

            if ciudad_actual == destino:
                # Reconstruir el camino
                camino = []
                while ciudad_actual is not None:
                    camino.append(ciudad_actual)
                    ciudad_actual = padres[ciudad_actual]
                camino.reverse()
                return camino, g_score[destino]

            if ciudad_actual in visitados:
                continue

            visitados.add(ciudad_actual)

            # Explorar vecinos
            for vecino, peso in grafo[ciudad_actual].items():
                if vecino in visitados:
                    continue

                # Calcular g tentativo
                g_tentativo = g_score[ciudad_actual] + peso

                # Si encontramos un mejor camino
                if g_tentativo < g_score[vecino]:
                    padres[vecino] = ciudad_actual
                    g_score[vecino] = g_tentativo
                    f_score[vecino] = g_tentativo + self.heuristica(
                        vecino, destino, coords
                    )
                    cola.put((f_score[vecino], vecino))

        # No hay camino
        return None, float("infinity")

    def voraz_manual(self, grafo, origen, destino, coords):
        """
        Implementación manual del algoritmo voraz (Best-First Search)
        """
        visitados = set()
        cola = PriorityQueue()
        cola.put((self.heuristica(origen, destino, coords), [origen]))

        while not cola.empty():
            _, camino = cola.get()
            ciudad_actual = camino[-1]

            if ciudad_actual == destino:
                # Calcular la distancia total del camino
                distancia = 0
                for i in range(len(camino) - 1):
                    distancia += grafo[camino[i]][camino[i + 1]]
                return camino, distancia

            if ciudad_actual in visitados:
                continue

            visitados.add(ciudad_actual)

            # Explorar vecinos ordenados por heurística
            for vecino in grafo[ciudad_actual]:
                if vecino not in camino:
                    h = self.heuristica(vecino, destino, coords)
                    cola.put((h, camino + [vecino]))

        # No hay camino
        return None, float("infinity")

    def ruta_dijkstra(self, origen, destino, show_distances, show_coordinates):
        """
        Calcula la ruta usando Dijkstra y genera visualización
        """
        G_visual, posiciones, _, grafo = self.construir_grafo()

        try:
            camino, distancia = self.dijkstra_manual(grafo, origen, destino)
            if camino:
                return self.visualizer.dibujar_ruta(
                    G_visual,
                    posiciones,
                    camino,
                    origen,
                    destino,
                    "dijkstra",
                    distancia,
                    show_distances=show_distances,
                    show_coordinates=show_coordinates,
                ), None
            else:
                return None, "No hay ruta entre las ciudades."
        except Exception as e:
            return None, f"Error: {str(e)}"

    def ruta_astar(self, origen, destino, show_distances, show_coordinates):
        """
        Calcula la ruta usando A* y genera visualización
        """
        G_visual, posiciones, coords, grafo = self.construir_grafo()

        try:
            camino, distancia = self.astar_manual(grafo, origen, destino, coords)
            if camino:
                return self.visualizer.dibujar_ruta(
                    G_visual,
                    posiciones,
                    camino,
                    origen,
                    destino,
                    "astar",
                    distancia,
                    show_distances=show_distances,
                    show_coordinates=show_coordinates,
                ), None
            else:
                return None, "No hay ruta entre las ciudades."
        except Exception as e:
            return None, f"Error: {str(e)}"

    def ruta_voraz(self, origen, destino, show_distances, show_coordinates):
        """
        Calcula la ruta usando algoritmo voraz y genera visualización
        """
        G_visual, posiciones, coords, grafo = self.construir_grafo()

        try:
            camino, distancia = self.voraz_manual(grafo, origen, destino, coords)
            if camino:
                return self.visualizer.dibujar_ruta(
                    G_visual,
                    posiciones,
                    camino,
                    origen,
                    destino,
                    "voraz",
                    distancia,
                    show_distances=show_distances,
                    show_coordinates=show_coordinates,
                ), None
            else:
                return None, "No hay ruta entre las ciudades."
        except Exception as e:
            return None, f"Error: {str(e)}"
