from neo4j import GraphDatabase
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger()


class Neo4jConnection:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            "bolt://localhost:7687", auth=("neo4j", "password123")
        )

    def close(self):
        self.driver.close()

    def session(self):
        """Retornar una sesión de Neo4j"""
        return self.driver.session()

    def run_query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record for record in result]

    def create_constraints(self):
        """Crear restricciones para asegurar que los nombres de ciudades sean únicos"""
        with self.driver.session() as session:
            # Verificar si la restricción ya existe para evitar errores
            constraints = session.run("SHOW CONSTRAINTS")
            constraint_exists = False
            for constraint in constraints:
                if "Ciudad" in str(constraint) and "name" in str(constraint):
                    constraint_exists = True
                    break

            if not constraint_exists:
                try:
                    session.run(
                        "CREATE CONSTRAINT FOR (c:Ciudad) REQUIRE c.name IS UNIQUE"
                    )
                    logger.info("Restricción de unicidad creada para Ciudad.name")
                except Exception as e:
                    logger.error(f"Error al crear la restricción: {e}")
