from fastapi import HTTPException
import pandas as pd
import spacy
import numpy as np
import fastcluster
from scipy.spatial.distance import pdist
from scipy.cluster import hierarchy
import os
from sklearn.cluster import MiniBatchKMeans
from sklearn.feature_extraction.text import CountVectorizer

# Mantenemos el modelo para lematización y limpieza
nlp = spacy.load("es_core_news_lg")

def build_tree_dict_kmeans(node, cluster_texts):
    if node.is_leaf():
        ejemplos = cluster_texts.get(node.id, ["Sin ejemplos"])[:3]
        nombre_corto = ejemplos[0][:40] + "..." if ejemplos else f"Grupo {node.id}"
        return {
            "name": nombre_corto,
            "ejemplos": ejemplos,
            "value": 1
        }
    return {
        "name": f"Macro_Cluster_{node.id}",
        "distancia": round(node.dist, 4),
        "children": [
            build_tree_dict_kmeans(node.left, cluster_texts),
            build_tree_dict_kmeans(node.right, cluster_texts)
        ]
    }

async def generar_dendrograma_jaccard_with_dataset():
    ruta_archivo = "data/REP_COMENTARIO2.csv"
    if not os.path.exists(ruta_archivo):
        raise HTTPException(status_code=404, detail=f"No se encontró el archivo en {ruta_archivo}")

    try:
        df = pd.read_csv(
            ruta_archivo, 
            sep=';', 
            encoding='utf-8', 
            on_bad_lines='skip',
            engine='python'
        )
        if "COMENTARIO" not in df.columns:
            raise HTTPException(status_code=400, detail="La columna 'COMENTARIO' no existe.")
            
        comentarios_unicos = df["COMENTARIO"].dropna().astype(str).unique().tolist()
        comentarios_validos = [c for c in comentarios_unicos if len(c.split()) > 1]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al leer el CSV: {str(e)}")

    if len(comentarios_validos) < 10:
         raise HTTPException(status_code=400, detail="Muy pocos comentarios válidos.")

    # 1. FASE A: PREPARACIÓN DE CONJUNTOS DE TEXTO (Requerido para Jaccard)
    textos_limpios = []
    textos_originales_mapeados = []
    
    # Extraemos lemas ignorando stopwords/puntuación para tener "conjuntos" representativos
    for doc in nlp.pipe(comentarios_validos, batch_size=2000, disable=["parser", "ner"]):
        lemas = [t.lemma_.lower() for t in doc if t.is_alpha and not t.is_stop]
        if lemas:
            textos_limpios.append(" ".join(lemas))
            textos_originales_mapeados.append(doc.text)

    if not textos_limpios:
        raise HTTPException(status_code=400, detail="No se extrajo texto válido tras la limpieza.")

    # Vectorizamos en formato BoW Binario (1 si la palabra está, 0 si no)
    vectorizer = CountVectorizer(binary=True, min_df=2)
    X_sparse = vectorizer.fit_transform(textos_limpios)

    # 2. FASE B: PRE-CLUSTERING LINEAL
    # MiniBatchKMeans soporta matrices dispersas nativamente, ahorrando memoria RAM
    n_clusters = min(500, X_sparse.shape[0])
    kmeans = MiniBatchKMeans(n_clusters=n_clusters, random_state=42, batch_size=2048, n_init='auto')
    kmeans.fit(X_sparse)

    textos_por_cluster = {i: [] for i in range(n_clusters)}
    for texto_orig, label in zip(textos_originales_mapeados, kmeans.labels_):
        if len(textos_por_cluster[label]) < 10:
            textos_por_cluster[label].append(texto_orig)

    # 3. FASE C: DENDROGRAMA CON DISTANCIA JACCARD
    # KMeans devuelve centroides como frecuencias (floats). 
    # Para evaluar la métrica de Jaccard matemáticamente estricta, binarizamos los centroides.
    # > 0.05 significa que asumimos la presencia del lema si aparece en > 5% del clúster.
    centroides_binarios = (kmeans.cluster_centers_ > 0.05).astype(bool)

    # Scipy calculará la intersección/unión sobre las matrices booleanas
    distancias_condensadas = pdist(centroides_binarios, metric='jaccard')
    matriz_linkage = fastcluster.linkage(distancias_condensadas, method='average')
    
    # 4. CONSTRUCCIÓN DEL ÁRBOL
    root_node, _ = hierarchy.to_tree(matriz_linkage, rd=True)
    arbol_json = build_tree_dict_kmeans(root_node, textos_por_cluster)

    return {
        "metadata": {
            "comentarios_unicos_validos": len(comentarios_validos),
            "comentarios_procesados": len(textos_originales_mapeados),
            "nodos_hoja_dendrograma": n_clusters,
            "metodo": "Lematización + BoW Binario + MiniBatchKMeans + Average Linkage (Jaccard)"
        },
        "dendrograma": arbol_json
    }