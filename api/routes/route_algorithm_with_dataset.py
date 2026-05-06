from fastapi import APIRouter
from core.distancia_coseno_with_dataset import generar_dendrograma_distancia_coseno_with_dataset
from core.jaccard_with_dataset import generar_dendrograma_jaccard_with_dataset
router = APIRouter()

@router.get("/distancia-coseno")
async def generar_dendrograma_distancia_coseno():
    return await generar_dendrograma_distancia_coseno_with_dataset()

@router.get("/jaccard")
async def generar_dendrograma_jaccard():
    return await generar_dendrograma_jaccard_with_dataset()