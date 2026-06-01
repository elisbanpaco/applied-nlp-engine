import os
from fastapi import HTTPException
import pandas as pd
import spacy
import numpy as np
import fastcluster
from scipy.spatial.distance import pdist
from scipy.cluster import hierarchy
from sklearn.cluster import MiniBatchKMeans

# Cargar el modelo de lenguaje pesado de producción
nlp = spacy.load("es_core_news_lg")

def build_tree_dict_kmeans(node, cluster_texts):
    """
    Construye de forma recursiva el árbol JSON jerárquico adaptado para Plotly.js.
    """
    if node.is_leaf():
        # Extraemos hasta 3 comentarios desidentificados de ejemplo para el Tooltip de la UI
        ejemplos = cluster_texts.get(node.id, ["Sin ejemplos"])[:3]
        # Fragmento representativo del primer documento para rotular la hoja
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

async def generar_dendrograma_distancia_coseno_with_dataset():
    """
    Calcula la topología jerárquica acoplada sobre el corpus seguro anonimizado de SUNARP.
    """
    # PARIDAD: Apuntamos estrictamente al corpus curado y anonimizado por el pipeline ético
    ruta_archivo = "data/REP_COMENTARIO2_ANONYMOUS.csv"
    if not os.path.exists(ruta_archivo):
        raise HTTPException(
            status_code=404, 
            detail=f"No se encontró el dataset desidentificado en {ruta_archivo}. Ejecute 01_anonymize_data.py primero."
        )

    try:
        # PARIDAD: Leemos el CSV sin cabecera tal como lo exportó el pipeline de privacidad
        df = pd.read_csv(
            ruta_archivo, 
            sep=';', 
            encoding='utf-8', 
            header=None,
            names=['COMENTARIO'],
            engine='python'
        )
        
        # Ingesta directa del corpus pre-procesado libre de duplicados y texto espurio
        comentarios_validos = df["COMENTARIO"].dropna().astype(str).tolist()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la lectura del corpus seguro: {str(e)}")

    if len(comentarios_validos) < 10:
         raise HTTPException(status_code=400, detail="Volumen insuficiente de documentos válidos en el corpus.")

    # 1. FASE A: VECTORIZACIÓN NEURO-LINGÜÍSTICA OPTIMIZADA
    vectores = []
    textos_procesados = []
    
    # Desactivamos componentes innecesarios para maximizar el throughput de la API
    for doc in nlp.pipe(comentarios_validos, batch_size=2000, disable=["parser", "ner", "lemmatizer"]):
        if doc.has_vector:
            vectores.append(doc.vector)
            textos_procesados.append(doc.text)

    X = np.array(vectores)

    # 2. FASE B: PRE-CLUSTERING DE REDUCCIÓN DIMENSIONAL ACUESTA
    # PARIDAD: Actualizado al óptimo matemático validado de k = 127 macro-representantes
    n_clusters = min(127, len(X)) 
    kmeans = MiniBatchKMeans(n_clusters=n_clusters, random_state=42, batch_size=2048, n_init='auto')
    kmeans.fit(X)
    
    centroides = kmeans.cluster_centers_

    # Agrupamos los textos correspondientes a cada centroide para la serialización
    textos_por_cluster = {i: [] for i in range(n_clusters)}
    for texto, label in zip(textos_processed := textos_procesados, kmeans.labels_):
        if len(textos_por_cluster[label]) < 10: 
            textos_por_cluster[label].append(texto)

    # 3. FASE C: CONSTRUCCIÓN TOPOLÓGICA DEL DENDROGRAMA EN C++
    # Enlace jerárquico promedio fundamentado en la geometría de la distancia coseno
    distancias_condensadas = pdist(centroides, metric='cosine')
    matriz_linkage = fastcluster.linkage(distancias_condensadas, method='average')
    
    # 4. PARSEO RECURSIVO PARA RENDERIZADO EN EL CLIENTE NEXT.JS
    root_node, _ = hierarchy.to_tree(matriz_linkage, rd=True)
    arbol_json = build_tree_dict_kmeans(root_node, textos_por_cluster)

    # Retorno estructurado idéntico a las métricas reportadas en los metadatos del artículo
    return {
        "metadata": {
            "comentarios_unicos_validos": len(comentarios_validos),
            "comentarios_vectorizados": len(textos_procesados),
            "nodos_hoja_dendrograma": n_clusters,
            "metodo": "Spacy + MiniBatchKMeans + Average Linkage (Coseno)"
        },
        "dendrograma": arbol_json
    }