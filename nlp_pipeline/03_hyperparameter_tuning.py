import json
import logging
import sys
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics import silhouette_score
import spacy
from sklearn.cluster import MiniBatchKMeans

# Configuración
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))
OUTPUTS_DIR = Path(__file__).parent / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

nlp = spacy.load("es_core_news_lg")

def vectorize_texts(texts: list) -> np.ndarray:
    logger.info("Vectorizando textos (Esto tomará tiempo)...")
    vectores = []
    for doc in nlp.pipe(texts, batch_size=2000, disable=["parser", "ner"]):
        if doc.has_vector:
            vectores.append(doc.vector)
    return np.array(vectores)

if __name__ == "__main__":
    logger.info("Iniciando búsqueda dinámica de hiperparámetros...")
    
    DATASET_PATH = PROJECT_ROOT / "api/data" / "REP_COMENTARIO2.csv" 
    
    # =========================================================================
    # LÓGICA: Reconstrucción de fragmentos y paridad con API
    # =========================================================================
    logger.info("Cargando corpus reconstruyendo saltos de línea huérfanos...")
    comentarios_brutos = []
    comentario_actual = ""
    
    try:
        with open(DATASET_PATH, 'r', encoding='utf-8', errors='ignore') as f:
            for linea in f:
                linea = linea.strip()
                if not linea:
                    continue
                
                if ';' in linea:
                    if comentario_actual:
                        # Limpiamos comillas extrañas antes de guardar
                        c_limpio = comentario_actual.strip()
                        if c_limpio.startswith('"') and c_limpio.endswith('"'):
                            c_limpio = c_limpio[1:-1].strip()
                        comentarios_brutos.append(c_limpio)
                    
                    partes = linea.split(';', 1)
                    comentario_actual = partes[1].strip() if len(partes) > 1 else ""
                else:
                    # Acumulamos el salto de línea huérfano
                    comentario_actual += " " + linea

        # Guardar el último
        if comentario_actual:
            c_limpio = comentario_actual.strip()
            if c_limpio.startswith('"') and c_limpio.endswith('"'):
                c_limpio = c_limpio[1:-1].strip()
            comentarios_brutos.append(c_limpio)
            
        logger.info(f"Comentarios brutos reconstruidos: {len(comentarios_brutos)}")

        # Aplicamos los MISMOS filtros que en tu API (Producción)
        df = pd.DataFrame({"COMENTARIO": comentarios_brutos})
        comentarios_unicos = df["COMENTARIO"].dropna().astype(str).unique().tolist()
        
        # Filtramos comentarios de una sola palabra
        comentarios = [c for c in comentarios_unicos if len(c.split()) > 1]
        
        logger.info(f"Total de comentarios válidos para modelo (únicos y >1 palabra): {len(comentarios)}")

    except FileNotFoundError:
        logger.error(f"No se encontró el archivo: {DATASET_PATH}")
        sys.exit(1)
    # =========================================================================
    
    # Vectorizamos
    X = vectorize_texts(comentarios)
    
    # Normalización L2 (Alinea la optimización de KMeans con el Silhouette Coseno)
    from sklearn.preprocessing import normalize
    X = normalize(X, norm='l2', axis=1)
    
    N = X.shape[0]
    logger.info(f"Matriz procesada. Total de documentos con vector (N) = {N}")

    # =========================================================================
    # LÓGICA : Generación Dinámica del Espacio de Búsqueda
    # =========================================================================
    # Regla de oro empírica: el k máximo suele ser la raíz cuadrada de N/2
    # 1. Calculamos la cota teórica basada en la raíz cuadrada de la densidad
    cota_teorica = int(np.sqrt(N / 2)) # ~328 para tu corpus completo

    # 2. Definimos el límite superior estirando la cota para dar flexibilidad al árbol jerárquico
    # Multiplicar por 1.5 desplaza el límite superior a ~500 de manera justificada por la densidad
    k_max = int(cota_teorica * 1.5)

    k_min = 50
        
    logger.info(f"Límite superior calculado (k_max) = {k_max}")

    # Generamos 5 valores de K distribuidos uniformemente desde 10 hasta k_max
    valores_k = np.linspace(k_min, k_max, num=5, dtype=int).tolist()
    logger.info(f"Cota teórica calculada: {cota_teorica}")
    logger.info(f"Rango de evaluación dinámico establecido: {valores_k}")
    # =========================================================================

    resultados_tuning = []

    for k in valores_k:
        logger.info(f"--- Evaluando k = {k} ---")
        
        # MiniBatchKMeans es la elección correcta para producción masiva
        kmeans = MiniBatchKMeans(n_clusters=k, random_state=42, batch_size=2048, n_init='auto')
        etiquetas = kmeans.fit_predict(X)
        
        inercia = float(kmeans.inertia_)
        
        # Muestra de 20k para que el Silhouette no tarde horas
        muestra = min(20000, N) 
        silhouette = silhouette_score(X, etiquetas, metric='cosine', sample_size=muestra, random_state=42)
        
        logger.info(f"k={k} -> Inercia: {inercia:.2f} | Silhouette: {silhouette:.4f}")
        
        resultados_tuning.append({
            "k": k,
            "inertia": inercia,
            "silhouette_score": float(silhouette)
        })

    # Guardamos el JSON
    filepath = OUTPUTS_DIR / "hyperparameter_tuning.json"
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(resultados_tuning, f, indent=4)
    logger.info(f"Resultados guardados exitosamente en {filepath}")