import pytest
from fastapi.testclient import TestClient

# Asegurar que importamos app desde el root del backend
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from main import app

client = TestClient(app)

def test_comparar_jaccard():
    response = client.post(
        "/api/v1/algoritmos/comparar-textos-jaccard",
        json={"textoA": "Hola mundo", "textoB": "Hola universo"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "similarity" in data
    assert 0.0 <= data["similarity"] <= 1.0

def test_comparar_coseno():
    response = client.post(
        "/api/v1/algoritmos/comparar-textos-distancia-coseno",
        json={"textoA": "Me encanta Python", "textoB": "Programar en Python es genial"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "similarity" in data
    assert 0.0 <= data["similarity"] <= 1.0

def test_comparar_textos_empty():
    # Probar que el backend no colapsa al recibir textos vacíos
    response = client.post(
        "/api/v1/algoritmos/comparar-textos-jaccard",
        json={"textoA": "", "textoB": ""}
    )
    assert response.status_code == 200
    assert response.json()["similarity"] == 0.0
