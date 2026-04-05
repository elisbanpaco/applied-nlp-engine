import spacy
import numpy as np

# 1. Cargamos nuestro "Diccionario de Vectores" en español
# print("Cargando modelo de lenguaje...")
nlp = spacy.load("es_core_news_md")

def obtener_vector_promedio(texto):
    """
    Esta función hace la magia transparente: limpia la frase, 
    busca los vectores y calcula el promedio.
    """
    # SpaCy lee el texto y lo separa en palabras (tokens)
    doc = nlp(texto)
    vectores_validos = []
    
    print(f"\nAnalizando: '{texto}'")
    for palabra in doc:
        # Filtramos las Stopwords ("el", "es", "muy") y la puntuación
        if not palabra.is_stop and not palabra.is_punct:
            # palabra.vector es el array de 300 números de esa palabra
            vectores_validos.append(palabra.vector)
            print("\nvector: ", palabra.vector)
            print(f" - Palabra clave retenida: '{palabra.text}'")
            
    if len(vectores_validos) == 0:
        return np.zeros(300)
    # Calculamos el promedio de todas las palabras válidas (centro de gravedad)
    # axis=0 significa que suma columna por columna y divide entre el total
    vector_promedio = np.mean(vectores_validos, axis=0)
    return vector_promedio

def distance_cosine(textoA, textoB):
    vectorA = obtener_vector_promedio(textoA)
    vectorB = obtener_vector_promedio(textoB)
    return np.dot(vectorA, vectorB) / (np.linalg.norm(vectorA) * np.linalg.norm(vectorB))



# # 2. Nuestras oraciones de prueba (diferentes palabras, mismo significado)
# oracion_A = "Mi vecino juega con su coche."
# oracion_B = "MI padre fue a una feria."

# # 3. Convertimos las oraciones en arrays de 300 números
# vector_A = obtener_vector_promedio(oracion_A)
# # print("\n resultado previo vector_A: ", vector_A)
# vector_B = obtener_vector_promedio(oracion_B)
# # print("\n resultado previo vector_B: ", vector_B)

# # 4. ¡TU FÓRMULA ORIGINAL! (Similitud del Coseno)
# # Como los vectores son arrays de NumPy, tu código original funciona perfectamente aquí
# cos_similarity = np.dot(vector_A, vector_B) / (np.linalg.norm(vector_A) * np.linalg.norm(vector_B))

# print("\n" + "="*40)
# print(f"Cosine Similarity final: {cos_similarity:.2f}")
# print("="*40)