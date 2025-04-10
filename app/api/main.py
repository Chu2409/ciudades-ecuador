# app/api/main.py
from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.algorithms.automatic_algorithms import AutomaticAlgoritmosService
from app.db.importer import ImporterService
from app.db.models import CiudadCreate, Conexion
from app.db.service import CrudService
from app.services.visualizaer import VisualizerService
from app.algorithms.manual_algorithms import ManualAlgoritmosService

app = FastAPI(
    title="API de Rutas",
    description="API para cálculo y visualización de rutas utilizando diferentes algoritmos",
    version="1.0.0",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos
    allow_headers=["*"],  # Permite todos los encabezados
)


# Dependencias para servicios
def get_visualizer_service():
    return VisualizerService()


def get_crud_service():
    return CrudService()


def get_importer_service():
    return ImporterService()


def get_algoritmos_service():
    return AutomaticAlgoritmosService()


# Rutas para importación de datos
@app.post("/importar-datos", tags=["Importación"])
def importar_datos(importer: ImporterService = Depends(get_importer_service)):
    """
    Importa datos iniciales a la base de datos Neo4j
    """
    try:
        importer.execute()
        return JSONResponse(
            {"status": "success", "message": "Datos importados exitosamente"}
        )
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


# Rutas para visualización del grafo
@app.get("/grafo", tags=["Visualización"])
def generar_grafo(
    show_distances: bool = Query(
        default=False, description="Mostrar distancias en el grafo"
    ),
    show_coordinates: bool = Query(
        default=False, description="Mostrar coordenadas de las ciudades"
    ),
    visualizer: VisualizerService = Depends(get_visualizer_service),
):
    """
    Genera una visualización del grafo de ciudades
    """
    try:
        path = visualizer.print_graph(
            show_distances=show_distances, show_coordinates=show_coordinates
        )
        return JSONResponse({"status": "success", "image_url": path})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


# Rutas para gestión de ciudades
@app.get("/ciudades", tags=["Ciudades"])
def listar_ciudades(crud: CrudService = Depends(get_crud_service)):
    """
    Obtiene la lista de todas las ciudades
    """
    try:
        ciudades = crud.get_all_cities()
        return JSONResponse({"status": "success", "data": ciudades})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


@app.post("/ciudades", tags=["Ciudades"])
def crear_ciudad(data: CiudadCreate, crud: CrudService = Depends(get_crud_service)):
    """
    Crea una nueva ciudad
    """
    try:
        result = crud.add_city(data.name, data.lat, data.lon)
        return JSONResponse(
            {
                "status": "success",
                "message": f"Ciudad {data.name} creada",
                "data": [dict(r["c"]) for r in result],
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/ciudades/{name}", tags=["Ciudades"])
def eliminar_ciudad(name: str, crud: CrudService = Depends(get_crud_service)):
    """
    Elimina una ciudad por su nombre
    """
    try:
        crud.delete_city(name)
        return JSONResponse(
            {"status": "success", "message": f"Ciudad {name} eliminada"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Rutas para gestión de conexiones
@app.get("/conexiones", tags=["Conexiones"])
def listar_conexiones(crud: CrudService = Depends(get_crud_service)):
    """
    Obtiene la lista de todas las conexiones entre ciudades
    """
    try:
        conexiones = crud.get_all_connections()
        return JSONResponse({"status": "success", "data": conexiones})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


@app.post("/conexiones", tags=["Conexiones"])
def crear_conexion(data: Conexion, crud: CrudService = Depends(get_crud_service)):
    """
    Crea una nueva conexión entre dos ciudades
    """
    try:
        crud.add_connection(data.city1, data.city2, data.distance)
        return JSONResponse(
            {
                "status": "success",
                "message": f"Conexión {data.city1} <-> {data.city2} creada",
            }
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/conexiones", tags=["Conexiones"])
def actualizar_conexion(data: Conexion, crud: CrudService = Depends(get_crud_service)):
    """
    Actualiza la distancia de una conexión existente
    """
    try:
        crud.update_connection(data.city1, data.city2, data.distance)
        return JSONResponse(
            {
                "status": "success",
                "message": f"Conexión {data.city1} <-> {data.city2} actualizada",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/conexiones", tags=["Conexiones"])
def eliminar_conexion(
    city1: str = Query(..., description="Nombre de la primera ciudad"),
    city2: str = Query(..., description="Nombre de la segunda ciudad"),
    crud: CrudService = Depends(get_crud_service),
):
    """
    Elimina una conexión entre dos ciudades
    """
    try:
        crud.delete_connection(city1, city2)
        return JSONResponse(
            {"status": "success", "message": f"Conexión {city1} <-> {city2} eliminada"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Rutas para algoritmos de cálculo de rutas
@app.get("/ruta/dijkstra", tags=["Algoritmos"])
def calcular_ruta_dijkstra(
    origen: str = Query(..., description="Ciudad de origen"),
    destino: str = Query(..., description="Ciudad de destino"),
    algoritmos: ManualAlgoritmosService = Depends(get_algoritmos_service),
):
    """
    Calcula la ruta óptima usando el algoritmo Dijkstra
    """
    img, error = algoritmos.ruta_dijkstra(origen, destino)
    if error:
        return JSONResponse({"status": "error", "message": error}, status_code=404)
    return JSONResponse({"status": "success", "image_url": img})


@app.get("/ruta/astar", tags=["Algoritmos"])
def calcular_ruta_astar(
    origen: str = Query(..., description="Ciudad de origen"),
    destino: str = Query(..., description="Ciudad de destino"),
    algoritmos: ManualAlgoritmosService = Depends(get_algoritmos_service),
):
    """
    Calcula la ruta óptima usando el algoritmo A*
    """
    img, error = algoritmos.ruta_astar(origen, destino)
    if error:
        return JSONResponse({"status": "error", "message": error}, status_code=404)
    return JSONResponse({"status": "success", "image_url": img})


@app.get("/ruta/voraz", tags=["Algoritmos"])
def calcular_ruta_voraz(
    origen: str = Query(..., description="Ciudad de origen"),
    destino: str = Query(..., description="Ciudad de destino"),
    algoritmos: ManualAlgoritmosService = Depends(get_algoritmos_service),
):
    """
    Calcula la ruta usando el algoritmo voraz (best-first search)
    """
    img, error = algoritmos.ruta_voraz(origen, destino)
    if error:
        return JSONResponse({"status": "error", "message": error}, status_code=404)
    return JSONResponse({"status": "success", "image_url": img})
