from pydantic import BaseModel

class Datos(BaseModel):
    textoA: str
    textoB: str

class ResultadoSalida(BaseModel):
    mensaje: str
    similarity: float