from pydantic import BaseModel


class CiudadCreate(BaseModel):
    name: str
    lat: float | None = None
    lon: float | None = None


class Conexion(BaseModel):
    city1: str
    city2: str
    distance: float
