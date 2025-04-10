import networkx as nx
from math import sqrt

from app.db.connection import Neo4jConnection
from app.services.visualizaer import VisualizerService


class AutomaticAlgoritmosService:
    def __init__(self):
        self.conn = Neo4jConnection()
        self.visualizer = VisualizerService()

    def heuristica(self, ciudad1, ciudad2, coords):
        # Distancia euclidiana (simplificada, puedes usar Haversine si quieres más precisión)
        lat1, lon1 = coords[ciudad1]
        lat2, lon2 = coords[ciudad2]
        return sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2)

    def ruta_dijkstra(self, origen, destino):
        G, posiciones, _ = self.visualizer.construir_grafo()
        try:
            camino = nx.dijkstra_path(G, origen, destino, weight="weight")
            distancia = nx.dijkstra_path_length(G, origen, destino, weight="weight")
            return self.visualizer.dibujar_ruta(
                G, posiciones, camino, origen, destino, "Dijkstra", distancia
            ), None
        except nx.NetworkXNoPath:
            return None, "No hay ruta entre las ciudades."

    def ruta_astar(self, origen, destino):
        G, posiciones, coords = self.visualizer.construir_grafo()
        try:
            camino = nx.astar_path(
                G,
                origen,
                destino,
                heuristic=lambda a, b: self.heuristica(a, b, coords),
                weight="weight",
            )
            distancia = nx.astar_path_length(
                G,
                origen,
                destino,
                heuristic=lambda a, b: self.heuristica(a, b, coords),
                weight="weight",
            )
            return self.visualizer.dibujar_ruta(
                G, posiciones, camino, origen, destino, "AStar", distancia
            ), None
        except nx.NetworkXNoPath:
            return None, "No hay ruta entre las ciudades."

    def ruta_voraz(self, origen, destino):
        G, posiciones, coords = self.visualizer.construir_grafo()

        from queue import PriorityQueue

        visitados = set()
        cola = PriorityQueue()
        cola.put((0, [origen]))  # prioridad, camino actual

        while not cola.empty():
            _, camino = cola.get()
            nodo_actual = camino[-1]

            if nodo_actual == destino:
                # Calcular distancia total
                distancia = sum(
                    G[camino[i]][camino[i + 1]]["weight"]
                    for i in range(len(camino) - 1)
                )
                return self.visualizer.dibujar_ruta(
                    G, posiciones, camino, origen, destino, "Voraz", distancia
                ), None

            if nodo_actual in visitados:
                continue
            visitados.add(nodo_actual)

            for vecino in G.neighbors(nodo_actual):
                if vecino not in camino:
                    heur = self.heuristica(vecino, destino, coords)
                    cola.put((heur, camino + [vecino]))

        return None, "No hay ruta entre las ciudades."
