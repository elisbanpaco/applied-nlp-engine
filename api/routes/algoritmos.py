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
        "similarity": float(result[0]),
        "palabrasA": result[1],
        "palabrasB": result[2],
        # "vectorA": result[3].tolist(),
        # "vectorB": result[4].tolist(),
        "textoA": result[3],
        "textoB": result[4]
        }


@router.post("/comparar-textos-jaccard")
async def enviarDatosJaccard(datos: Datos):

    result = jaccard(datos.textoA, datos.textoB)
    return {
        "message": "Datos enviados correctamente",
        "similarity": float(result[0]),
        "conjuntoA": result[1],
        "conjuntoB": result[2]
        }