import networkx as nx
import matplotlib.pyplot as plt
from geopy.distance import geodesic
import heapq
import numpy as np

from app.db.connection import Neo4jConnection


class RouteFinder:
    def __init__(self):
        self.driver = Neo4jConnection()

    def close(self):
        self.driver.close()

    def build_graph(self):
        """Construir grafo desde Neo4j"""
        graph = nx.Graph()
        with self.driver.session() as session:
            # Agregar nodos
            nodes = session.run(
                "MATCH (c:Ciudad) RETURN c.name AS name, c.latitude AS lat, c.longitude AS lon"
            )
            for record in nodes:
                # Verificar que las coordenadas no sean None
                lat = record["lat"]
                lon = record["lon"]
                if lat is not None and lon is not None:
                    graph.add_node(record["name"], pos=(float(lon), float(lat)))
                else:
                    # Si no hay coordenadas, agregamos el nodo sin la posición
                    graph.add_node(record["name"])
                    print(
                        f"Advertencia: Coordenadas no disponibles para {record['name']}"
                    )

            # Agregar aristas
            edges = session.run("""
                MATCH (c1:Ciudad)-[r:CONECTA_CON]->(c2:Ciudad)
                WHERE id(c1) < id(c2)  // para evitar duplicados
                RETURN c1.name AS city1, c2.name AS city2, r.distancia AS distance
            """)
            for record in edges:
                graph.add_edge(
                    record["city1"], record["city2"], weight=float(record["distance"])
                )
        return graph

    def _heuristic(self, node1, node2, graph):
        """Calcular distancia geográfica como heurística si hay coordenadas disponibles"""
        # Verificar si los nodos tienen coordenadas
        if "pos" in graph.nodes[node1] and "pos" in graph.nodes[node2]:
            pos1 = graph.nodes[node1]["pos"]
            pos2 = graph.nodes[node2]["pos"]
            # Las posiciones son (lon, lat), pero geodesic espera (lat, lon)
            return geodesic((pos1[1], pos1[0]), (pos2[1], pos2[0])).kilometers
        else:
            # Fallback: usar la distancia mínima conocida si existe un camino directo
            if graph.has_edge(node1, node2):
                return graph.edges[node1, node2]["weight"]
            # Si no hay coordenadas ni conexión directa, usamos un valor arbitrario
            return 500  # distancia arbitraria en km

    def dijkstra(self, graph, start, goal):
        return nx.dijkstra_path(graph, start, goal, weight="weight")

    def greedy_best_first(self, graph, start, goal):
        frontier = [(0, start)]
        came_from = {start: None}
        visited = set()

        while frontier:
            _, current = heapq.heappop(frontier)
            if current == goal:
                break
            visited.add(current)

            for neighbor in graph.neighbors(current):
                if neighbor in visited:
                    continue
                if neighbor not in came_from:
                    came_from[neighbor] = current
                    h = self._heuristic(neighbor, goal, graph)
                    heapq.heappush(frontier, (h, neighbor))

        return self._reconstruct_path(came_from, start, goal)

    def a_star(self, graph, start, goal):
        frontier = [(0, start)]
        came_from = {start: None}
        cost_so_far = {start: 0}

        while frontier:
            _, current = heapq.heappop(frontier)

            if current == goal:
                break

            for neighbor in graph.neighbors(current):
                new_cost = (
                    cost_so_far[current] + graph.edges[current, neighbor]["weight"]
                )
                if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                    cost_so_far[neighbor] = new_cost
                    priority = new_cost + self._heuristic(neighbor, goal, graph)
                    heapq.heappush(frontier, (priority, neighbor))
                    came_from[neighbor] = current

        return self._reconstruct_path(came_from, start, goal)

    def _reconstruct_path(self, came_from, start, goal):
        current = goal
        path = []
        while current != start:
            if current is None or current not in came_from:
                return []  # No se encontró camino
            path.append(current)
            current = came_from[current]
        path.append(start)
        path.reverse()
        return path

    def draw_graph(self, graph, path=None):
        # Verificar si todos los nodos tienen coordenadas
        nodes_with_pos = [
            node for node, data in graph.nodes(data=True) if "pos" in data
        ]

        if not nodes_with_pos:
            print(
                "Error: No hay coordenadas disponibles para ningún nodo. Utilizando layout spring."
            )
            pos = nx.spring_layout(graph)  # Layout alternativo si no hay coordenadas
        else:
            # Usar las coordenadas disponibles
            pos = {}
            for node in graph.nodes():
                if "pos" in graph.nodes[node]:
                    pos[node] = graph.nodes[node]["pos"]
                else:
                    # Para nodos sin coordenadas, usamos None y luego los posicionamos
                    pos[node] = None

            # Completar posiciones para nodos que no tienen coordenadas
            # usando spring_layout solo para esos nodos
            missing_pos = {n: pos[n] for n in pos if pos[n] is None}
            if missing_pos:
                # Crear un subgrafo con los nodos que tienen posición
                fixed_nodes = [n for n in pos if pos[n] is not None]
                fixed_positions = {n: pos[n] for n in fixed_nodes}

                # Calcular posiciones para los nodos restantes
                remaining_pos = nx.spring_layout(
                    graph, pos=fixed_positions, fixed=fixed_nodes
                )

                # Actualizar las posiciones
                pos.update(remaining_pos)

        plt.figure(figsize=(12, 10))

        # Dibujar todas las aristas
        nx.draw_networkx_edges(graph, pos, edge_color="gray", width=1.0)

        # Dibujar todos los nodos
        nx.draw_networkx_nodes(graph, pos, node_color="lightblue", node_size=300)

        # Dibujar las etiquetas
        nx.draw_networkx_labels(graph, pos)

        # Si hay un camino, dibujarlo
        if path and len(path) > 1:
            path_edges = list(zip(path, path[1:]))
            nx.draw_networkx_nodes(
                graph, pos, nodelist=path, node_color="orange", node_size=400
            )
            nx.draw_networkx_edges(
                graph, pos, edgelist=path_edges, edge_color="red", width=3.0
            )

        plt.title("Grafo de ciudades del Ecuador")
        plt.axis("off")  # Desactivar ejes
        plt.tight_layout()
        plt.savefig(f"graph_{np.random.randint(1000, 9999)}.png")
        plt.show()


if __name__ == "__main__":
    finder = RouteFinder()

    try:
        G = finder.build_graph()
        origen = "Quito"
        destino = "Cuenca"

        print("A*:")
        path_a_star = finder.a_star(G, origen, destino)
        print(path_a_star)
        finder.draw_graph(G, path_a_star)

        print("\nBúsqueda Voraz:")
        path_greedy = finder.greedy_best_first(G, origen, destino)
        print(path_greedy)
        finder.draw_graph(G, path_greedy)

        print("\nDijkstra:")
        path_dijkstra = finder.dijkstra(G, origen, destino)
        print(path_dijkstra)
        finder.draw_graph(G, path_dijkstra)

    finally:
        finder.close()
