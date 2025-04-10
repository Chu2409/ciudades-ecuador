import time
from app.db.connection import Neo4jConnection
import networkx as nx
import matplotlib.pyplot as plt
import os


class VisualizerService:
    def __init__(self):
        self.conn = Neo4jConnection()

    def dibujar_ruta(
        self,
        G,
        posiciones,
        camino,
        origen,
        destino,
        algoritmo,
        distancia_total,
        show_distances=False,
        show_coordinates=False,
    ):
        plt.figure(figsize=(18, 14))
        nx.draw(
            G, pos=posiciones, with_labels=True, node_size=1000, node_color="lightgray"
        )

        path_edges = list(zip(camino, camino[1:]))
        nx.draw_networkx_nodes(G, posiciones, nodelist=camino, node_color="orange")
        nx.draw_networkx_edges(
            G, posiciones, edgelist=path_edges, edge_color="red", width=3
        )

        # Mostrar distancias si se solicita
        if show_distances:
            edge_labels = nx.get_edge_attributes(G, "weight")
            nx.draw_networkx_edge_labels(
                G, posiciones, edge_labels=edge_labels, font_size=12
            )

        # Mostrar coordenadas si se solicita
        if show_coordinates:
            coord_labels = {}
            for node, (lat, lon) in posiciones.items():
                coord_labels[node] = f"({lat:.4f}, {lon:.4f})"

            # Posicionamiento de las etiquetas de coordenadas por encima de los nodos
            coord_pos = {node: (x, y + 0.08) for node, (x, y) in posiciones.items()}

            nx.draw_networkx_labels(
                G, pos=coord_pos, labels=coord_labels, font_size=10, font_color="red"
            )

        timestamp = int(time.time())
        filename = f"{algoritmo}_{timestamp}.png"
        path = os.path.join("web/public/py", filename)
        plt.title(f"{algoritmo} → {origen} → {destino} ({distancia_total:.2f} km)")
        plt.savefig(path)
        plt.close()
        return filename

    def print_graph(self, show_distances=False, show_coordinates=False):
        # 1. Consultar nodos
        nodos_query = """
        MATCH (c:Ciudad)
        RETURN c.name AS name, c.latitude AS lat, c.longitude AS lon
        """
        nodos = self.conn.run_query(nodos_query)

        # 2. Consultar relaciones sin duplicar
        relaciones_query = """
        MATCH (c1:Ciudad)-[r:CONECTA_CON]->(c2:Ciudad)
        WHERE id(c1) < id(c2)
        RETURN c1.name AS origen, c2.name AS destino, r.distancia AS distancia
        """
        relaciones = self.conn.run_query(relaciones_query)

        # 3. Construir el grafo
        G = nx.Graph()
        posiciones = {}
        coordenadas = {}  # Diccionario para almacenar las coordenadas

        for nodo in nodos:
            name = nodo["name"]
            lat = nodo["lat"]
            lon = nodo["lon"]
            G.add_node(name)
            posiciones[name] = (lon, lat)
            coordenadas[name] = (
                lat,
                lon,
            )  # Guardamos las coordenadas en formato (lat, lon)

        for r in relaciones:
            G.add_edge(r["origen"], r["destino"], weight=r["distancia"])

        # 4. Dibujar el grafo
        plt.figure(figsize=(18, 14))
        nx.draw(
            G,
            pos=posiciones,
            with_labels=True,
            node_color="skyblue",
            node_size=900,
            font_size=12,
            edge_color="gray",
        )

        # Mostrar distancias si se solicita
        if show_distances:
            edge_labels = nx.get_edge_attributes(G, "weight")
            nx.draw_networkx_edge_labels(
                G, posiciones, edge_labels=edge_labels, font_size=12
            )

        # Mostrar coordenadas si se solicita
        if show_coordinates:
            coord_labels = {}
            for node, (lat, lon) in coordenadas.items():
                coord_labels[node] = f"({lat:.4f}, {lon:.4f})"

            # Posicionamiento de las etiquetas de coordenadas por encima de los nodos
            coord_pos = {node: (x, y + 0.08) for node, (x, y) in posiciones.items()}

            nx.draw_networkx_labels(
                G, pos=coord_pos, labels=coord_labels, font_size=10, font_color="red"
            )

        # 5. Guardar imagen
        timestamp = int(time.time())
        filename = f"grafo_{timestamp}.png"
        output_path = os.path.join("web/public/py", filename)
        plt.savefig(output_path)
        plt.close()

        return filename

    def construir_grafo(self):
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

        G = nx.Graph()
        posiciones = {}
        coords = {}

        for nodo in nodos:
            nombre = nodo["name"]
            G.add_node(nombre)
            posiciones[nombre] = (nodo["lon"], nodo["lat"])
            coords[nombre] = (nodo["lat"], nodo["lon"])

        for r in relaciones:
            G.add_edge(r["origen"], r["destino"], weight=r["distancia"])

        return G, posiciones, coords
