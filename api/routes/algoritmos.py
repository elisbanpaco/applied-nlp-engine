from fastapi import APIRouter
from schemas.data_models import Datos
from core.distancia_coseno import distance_cosine
from core.jaccard import jaccard
router = APIRouter()

# Ruta para ALGORITMOS
@router.post("/comparar-textos-distancia-coseno")
async def enviarDatosDistanciaCoseno(datos: Datos):

    result = distance_cosine(datos.textoA, datos.textoB)
    return {
        "message": "Datos enviados correctamente",
        "similarity": float(result)
        }


@router.post("/comparar-textos-jaccard")
async def enviarDatosJaccard(datos: Datos):

    result = jaccard(datos.textoA, datos.textoB)
    return {
        "message": "Datos enviados correctamente",
        "similarity": float(result)
        }