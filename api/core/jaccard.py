import spacy

# Cargamos el modelo en español
nlp = spacy.load("es_core_news_lg")

def set_limpio(texto):
    """
    Toma un string crudo, lo procesa, elimina stopwords/puntuación
    y devuelve un 'set' de palabras clave en minúsculas.
    """
    # 1. Pasamos el texto a minúsculas (para que 'Python' y 'python' sean iguales)
    doc = nlp(texto.lower())
    
    # 2. Usamos "Set Comprehension" para filtrar y crear el set en una sola línea
    palabras_limpias = {
        token.text for token in doc 
        if not token.is_stop and not token.is_punct and not token.is_space
    }
    
    return palabras_limpias

def similitud_jaccard(conjunto1, conjunto2):
    """
    Calcula el índice de Jaccard entre dos conjuntos de datos.
    Ambos inputs deben ser de tipo 'set' en Python.
    """
    # 1. ¿Qué elementos tienen en común? (Intersección)
    interseccion = conjunto1.intersection(conjunto2)
    
    # 2. ¿Cuántos elementos únicos hay en total? (Unión)
    union = conjunto1.union(conjunto2)
    
    # 3. Prevención de errores: si ambos conjuntos están vacíos
    if len(union) == 0:
        return 0.0
        
    # 4. Fórmula Matemática: |A ∩ B| / |A ∪ B|
    return len(interseccion) / len(union)


def jaccard(textoA, textoB):
    conjuntoA = set_limpio(textoA)
    conjuntoB = set_limpio(textoB)

    similarity = similitud_jaccard(conjuntoA, conjuntoB)
    return (
        similarity,
        conjuntoA,
        conjuntoB
    )




# # Usamos 'set' usando las llaves {} en Python
# requisitos_puesto = {"python", "aws", "docker", "linux", "sql"}

# candidato_ideal = {"python", "aws", "docker", "linux", "sql"}
# candidato_bueno = {"python", "aws", "docker", "html", "css"}
# candidato_malo  = {"javascript", "react", "node", "mongo"}

# # Evaluamos
# score_ideal = similitud_jaccard(requisitos_puesto, candidato_ideal)
# score_bueno = similitud_jaccard(requisitos_puesto, candidato_bueno)
# score_malo  = similitud_jaccard(requisitos_puesto, candidato_malo)

# print("=== RESULTADOS DEL MATCHING (JACCARD) ===")
# print(f"Candidato Ideal: {score_ideal:.2f} (Match del {score_ideal*100}%)")
# print(f"Candidato Bueno: {score_bueno:.2f} (Match del {score_bueno*100}%)")
# print(f"Candidato Malo : {score_malo:.2f} (Match del {score_malo*100}%)")