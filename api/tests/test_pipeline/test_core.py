import pytest
from core.jaccard import similitud_jaccard, jaccard
from core.distancia_coseno import distance_cosine

def test_similitud_jaccard_basic():
    # Intersection = 2 (b, c), Union = 4 (a, b, c, d)
    score = similitud_jaccard({"a", "b", "c"}, {"b", "c", "d"})
    assert score == 0.5

def test_similitud_jaccard_empty():
    score = similitud_jaccard(set(), set())
    assert score == 0.0

def test_jaccard_texts():
    score, setA, setB = jaccard("El coche rápido", "El coche muy rápido")
    # Dependiendo de las stopwords (el, muy), la similitud debe ser alta
    assert score > 0.0
    assert type(setA) is set
    assert type(setB) is set

def test_distance_cosine_basic():
    score, wordsA, wordsB, textA, textB = distance_cosine("Inteligencia artificial", "Machine learning")
    assert 0.0 <= score <= 1.0
    assert type(wordsA) is list
    assert type(wordsB) is list
