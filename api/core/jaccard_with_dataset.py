import os
from fastapi import HTTPException
import pandas as pd
import spacy
import numpy as np
import fastcluster
from scipy.spatial.distance import pdist
from scipy.cluster import hierarchy
from sklearn.cluster import MiniBatchKMeans
from sklearn.feature_extraction.text import CountVectorizer

# Mantenemos el modelo únicamente para extraer las raíces morfológicas (Lemas)
nlp = spacy.load("es_core_news_lg")

def build_tree_dict_kmeans(node, cluster_texts):
    """
    Construye de forma recursiva el árbol JSON jerárquico adaptado para Plotly.js.
    """
    if node.is_leaf():
        # Extraemos hasta 3 ejemplos desidentificados para el Tooltip (Hover) en Next.js
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
    """
    Calcula la topología jerárquica aglomerativa usando la métrica de Jaccard 
    sobre el corpus seguro anonimizado de la SUNARP.
    """
    # PARIDAD: Apuntamos estrictamente al corpus curado libre de PII
    ruta_archivo = "data/REP_COMENTARIO2_ANONYMOUS.csv"
    if not os.path.exists(ruta_archivo):
        raise HTTPException(
            status_code=404, 
            detail=f"No se encontró el dataset desidentificado en {ruta_archivo}. Ejecute 01_anonymize_data.py primero."
        )

    try:
        # PARIDAD: Leemos el CSV sin cabecera tal como lo exportó tu pipeline de privacidad
        df = pd.read_csv(
            ruta_archivo, 
            sep=';', 
            encoding='utf-8', 
            header=None,
            names=['COMENTARIO'],
            engine='python'
        )
        
        # Ingesta directa del corpus pre-procesado listo para tokenización léxica
        comentarios_validos = df["COMENTARIO"].dropna().astype(str).tolist()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la lectura del corpus seguro: {str(e)}")

    if len(comentarios_validos) < 10:
         raise HTTPException(status_code=400, detail="Volumen insuficiente de documentos válidos en el corpus.")

    # 1. FASE A: PREPARACIÓN DE CONJUNTOS DE TEXTO (Lematización binaria para Jaccard)
    textos_limpios = []
    textos_originales_mapeados = []
    
    # Desactivamos componentes pesados; solo requerimos el tokenizador y el lematizador nativo
    for doc in nlp.pipe(comentarios_validos, batch_size=2000, disable=["parser", "ner"]):
        lemas = [t.lemma_.lower() for t in doc if t.is_alpha and not t.is_stop]
        if lemas:
            textos_limpios.append(" ".join(lemas))
            textos_originales_mapeados.append(doc.text)

    if not textos_limpios:
        raise HTTPException(status_code=400, detail="No se extrajo texto válido tras la limpieza lingüística.")

    # Vectorizamos en formato Bag-of-Words binario puro (presencia = 1, ausencia = 0)
    vectorizer = CountVectorizer(binary=True, min_df=2)
    X_sparse = vectorizer.fit_transform(textos_limpios)

    # 2. FASE B: PRE-CLUSTERING LINEAL SOBRE MATRICES DISPERSAS
    # PARIDAD: Actualizado al óptimo matemático validado de k = 127 centroides estructurales
    n_clusters = min(127, X_sparse.shape[0])
    kmeans = MiniBatchKMeans(n_clusters=n_clusters, random_state=42, batch_size=2048, n_init='auto')
    kmeans.fit(X_sparse)

    textos_por_cluster = {i: [] for i in range(n_clusters)}
    for texto_orig, label in zip(textos_originales_mapeados, kmeans.labels_):
        if len(textos_por_cluster[label]) < 10:
            textos_por_cluster[label].append(texto_orig)

    # 3. FASE C: DENDROGRAMA CON ENLACE PROMEDIO Y DISTANCIA JACCARD
    # Proyección a Medoides: Seleccionamos el documento real más cercano al centroide de cada cluster.
    # Esto asegura vectores puramente binarios válidos (sin flotantes ni umbrales arbitrarios) y evita vectores vacíos (all-zeros).
    centroides_binarios = np.zeros((n_clusters, X_sparse.shape[1]), dtype=bool)
    for i in range(n_clusters):
        indices_doc_cluster = np.where(kmeans.labels_ == i)[0]
        if len(indices_doc_cluster) > 0:
            # Convertimos a denso de manera perezosa únicamente para los documentos asignados a este cluster
            docs_cluster = X_sparse[indices_doc_cluster].toarray()
            distancias = np.linalg.norm(docs_cluster - kmeans.cluster_centers_[i], axis=1)
            idx_mejor_doc = indices_doc_cluster[np.argmin(distancias)]
            # Guardamos el vector binario del medoide real del cluster
            centroides_binarios[i] = X_sparse[idx_mejor_doc].toarray().astype(bool)[0]
        else:
            # Fallback en caso extremadamente raro de cluster sin asignaciones
            centroides_binarios[i] = (kmeans.cluster_centers_[i] > 0.05).astype(bool)

    # Ejecución de operaciones booleanas condensadas de intersección/unión (Jaccard)
    distancias_condensadas = pdist(centroides_binarios, metric='jaccard')
    matriz_linkage = fastcluster.linkage(distancias_condensadas, method='average')
    
    # 4. PARSEO RECURSIVO PARA INTERFAZ GRÁFICA EN NEXT.JS
    root_node, _ = hierarchy.to_tree(matriz_linkage, rd=True)
    arbol_json = build_tree_dict_kmeans(root_node, textos_por_cluster)

    # Retorno con metadatos perfectamente calibrados con el Anexo B de tu manuscrito
    return {
        "metadata": {
            "comentarios_unicos_validos": len(comentarios_validos),
            "comentarios_vectorizados": len(textos_originales_mapeados),
            "nodos_hoja_dendrograma": n_clusters,
            "metodo": "Lematización + BoW Binario + MiniBatchKMeans + Average Linkage (Jaccard)"
        },
        "dendrograma": arbol_json
    }