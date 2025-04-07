# app/api/main.py
from fastapi import FastAPI
from app.db.importer import main as importar_datos

app = FastAPI()


@app.post("/importar-datos")
def importar():
    importar_datos()
    return {"message": "Datos importados con éxito"}
