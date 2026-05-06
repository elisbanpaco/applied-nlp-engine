from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.algoritmos import router as algoritmos_router
from routes.route_algorithm_with_dataset import router as route_algorithm_with_dataset

app = FastAPI(title="Applied NLP Engine", version="0.0.2")

origins = [
    "http://localhost:3000",
    "https://dublin-drunk-blond-sudden.trycloudflare.com"
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
app.include_router(route_algorithm_with_dataset, prefix="/api/v1/clustering", tags=["clustering"])
