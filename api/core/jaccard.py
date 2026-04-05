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

# --- CASO DE USO REAL: Sistema de Reclutamiento ---

# Usamos 'set' usando las llaves {} en Python
requisitos_puesto = {"python", "aws", "docker", "linux", "sql"}

candidato_ideal = {"python", "aws", "docker", "linux", "sql"}
candidato_bueno = {"python", "aws", "docker", "html", "css"}
candidato_malo  = {"javascript", "react", "node", "mongo"}

# Evaluamos
score_ideal = similitud_jaccard(requisitos_puesto, candidato_ideal)
score_bueno = similitud_jaccard(requisitos_puesto, candidato_bueno)
score_malo  = similitud_jaccard(requisitos_puesto, candidato_malo)

print("=== RESULTADOS DEL MATCHING (JACCARD) ===")
print(f"Candidato Ideal: {score_ideal:.2f} (Match del {score_ideal*100}%)")
print(f"Candidato Bueno: {score_bueno:.2f} (Match del {score_bueno*100}%)")
print(f"Candidato Malo : {score_malo:.2f} (Match del {score_malo*100}%)")