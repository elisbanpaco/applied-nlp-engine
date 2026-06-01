import json
import logging
import sys
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics import silhouette_score, davies_bouldin_score
import spacy
from sklearn.cluster import MiniBatchKMeans
import fastcluster
from scipy.cluster.hierarchy import fcluster

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))

# Configuración de Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Cargar modelo spaCy
try:
    nlp = spacy.load("es_core_news_lg")
    logger.info("Modelo spaCy cargado correctamente")
except OSError:
    logger.error("No se encontró el modelo spaCy")
    sys.exit(1)


def vectorize_texts(texts: list) -> tuple:
    """
    Vectoriza textos usando spaCy (embeddings).
    Retorna: (feature_matrix, processed_texts)
    """
    logger.info(f"Vectorizando {len(texts)} textos...")
    vectores = []
    textos_procesados = []
    
    for doc in nlp.pipe(texts, batch_size=2000, disable=["parser", "ner"]):
        if doc.has_vector:
            vectores.append(doc.vector)
            textos_procesados.append(doc.text)
    
    X = np.array(vectores)
    logger.info(f"Vectorización completada. Shape: {X.shape}")
    return X, textos_procesados


def cluster_texts(feature_matrix: np.ndarray, n_clusters: int = 50) -> np.ndarray:
    """
    Aplica MiniBatchKMeans para clustering.
    Retorna: array de etiquetas de cluster
    """
    logger.info(f"Aplicando clustering con {n_clusters} clusters...")
    n_clusters = min(n_clusters, feature_matrix.shape[0])
    kmeans = MiniBatchKMeans(n_clusters=n_clusters, random_state=42, batch_size=2048, n_init='auto')
    labels = kmeans.fit_predict(feature_matrix)
    logger.info(f"Clustering completado. Clusters únicos: {len(np.unique(labels))}")
    return labels

# Rutas relativas al script
PIPELINE_DIR = Path(__file__).parent
OUTPUTS_DIR = PIPELINE_DIR / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)

def evaluate_clustering(feature_matrix: np.ndarray, cluster_labels: np.ndarray) -> dict:
    """
    Evalúa la calidad matemática de los clusters usando métricas intrínsecas.
    """
    logger.info("Iniciando evaluación matemática de los clusters...")
    
    unique_labels = np.unique(cluster_labels)
    valid_labels = unique_labels[unique_labels != -1] # Ignorar ruido (-1) si existe
    
    if len(valid_labels) <= 1:
        logger.error("Se requiere más de un cluster para calcular las métricas.")
        return {"error": "Insuficientes clusters válidos"}

    # Métrica 1: Silhouette Score (Usa 'cosine' si son embeddings/TF-IDF, 'euclidean' si son coordenadas)
    logger.info("Calculando Silhouette Score (Esto puede tomar un momento)...")
    silhouette = silhouette_score(feature_matrix, cluster_labels, metric='cosine')
    
    # Métrica 2: Davies-Bouldin Index
    logger.info("Calculando Davies-Bouldin Index...")
    db_index = davies_bouldin_score(feature_matrix, cluster_labels)
    
    metrics = {
        "silhouette_score": round(float(silhouette), 4),
        "davies_bouldin_index": round(float(db_index), 4),
        "n_clusters": int(len(valid_labels)),
        "n_noise_points": int(np.sum(cluster_labels == -1))
    }
    
    logger.info(f"Evaluación completada: {metrics}")
    return metrics

def save_metrics(metrics: dict, filename: str = "metrics.json"):
    """Guarda las métricas en un archivo JSON."""
    filepath = OUTPUTS_DIR / filename
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=4)
    logger.info(f"Métricas guardadas exitosamente en: {filepath}")

if __name__ == "__main__":
    try:
        # =====================================================================
        # PASO 1: IMPORTA TUS FUNCIONES REALES AQUÍ
        # Reemplaza 'api.mi_motor' con el nombre real de tu archivo en api/
        # =====================================================================
        # Ejemplo: from api.processor import vectorize_texts, cluster_texts
        
        logger.info("Cargando el dataset real...")
        # =====================================================================
        # PASO 2: CARGA TU DATASET
        # Asegúrate de poner la ruta correcta a tus 238,781 comentarios.
        # Te sugiero usar nrows=5000 primero para probar que todo funcione rápido.
        # =====================================================================
        DATASET_PATH = PROJECT_ROOT / "api/data" / "REP_COMENTARIO2.csv" 
        

        # Leemos el archivo indicando que NO hay cabecera y nombrando las columnas
        df = pd.read_csv(
            DATASET_PATH, 
            sep=';',              
            on_bad_lines='skip',  
            engine='python',      
            encoding='utf-8',
            header=None,                              # ¡NUEVO! Le decimos que no hay cabecera
            names=['origen', 'comentario']            # ¡NUEVO! Bautizamos las columnas
        )
        
        # Ahora sí, extraemos la columna que acabamos de nombrar como 'comentario'
        comentarios = df['comentario'].dropna().astype(str).tolist()

        logger.info("Vectorizando textos y aplicando clustering (Llamando al motor real)...")

        matriz_caracteristicas, textos_procesados = vectorize_texts(comentarios)
        logger.info("Fase A: Extrayendo macro-representantes con MiniBatchKMeans...")
        kmeans = MiniBatchKMeans(n_clusters=500, random_state=42, batch_size=2048, n_init='auto')
        kmeans.fit(matriz_caracteristicas)
        centroides = kmeans.cluster_centers_  # Shape: (500, 300)

        # 2. Paso jerárquico: Construir el linkage real de tu motor
        logger.info("Fase B: Construyendo linkage jerárquico real (Coseno)...")
        from scipy.spatial.distance import pdist
        distancias_condensadas = pdist(centroides, metric='cosine')
        matriz_linkage = fastcluster.linkage(distancias_condensadas, method='average')

        # 3. Cortar el árbol en 'T' clusters para poder evaluarlo cuantitativamente
        # Vamos a simular que queremos evaluar cómo se comporta si extraemos 50 grupos del árbol
        n_cortes_evaluacion = 50 
        etiquetas_jerarquicas = fcluster(matriz_linkage, t=n_cortes_evaluacion, criterion='maxclust')

        # 4. Evaluación formal: Evaluamos los centroides agrupados por el árbol jerárquico
        resultados = evaluate_clustering(centroides, etiquetas_jerarquicas)
        if "error" not in resultados:
            save_metrics(resultados, filename="metricas_reales.json")

    except Exception as e:
        logger.error(f"Error crítico en el pipeline: {str(e)}", exc_info=True)