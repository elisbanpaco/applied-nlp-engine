from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.algoritmos import router as algoritmos_router

app = FastAPI(title="Applied NLP Engine", version="0.0.1")

origins = [
    "http://localhost:3000",
]
# Configuración de CORS (Vital para que tu frontend se comunique)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(algoritmos_router, prefix="/api/v1/algoritmos", tags=["algoritmos"])

@app.get("/")
def read_root():
    return {"status": "API funcionando correctamente"}