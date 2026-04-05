from fastapi import APIRouter
from schemas.data_models import Datos
from core.distancia_coseno import distance_cosine
router = APIRouter()

# Ruta para ALGORITMOS
@router.post("/comparar-textos")
async def enviarDatos(datos: Datos):

    result = distance_cosine(datos.textoA, datos.textoB)
    return {
        "message": "Datos enviados correctamente",
        "similarity": float(result)
        }