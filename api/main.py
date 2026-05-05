from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.algoritmos import router as algoritmos_router

# Importamos las librerias temporales
from fastapi import FastAPI, HTTPException
import pandas as pd
import spacy
import numpy as np
import fastcluster
from scipy.spatial.distance import pdist
from scipy.cluster import hierarchy
import re
import os
from sklearn.cluster import MiniBatchKMeans

app = FastAPI(title="Applied NLP Engine", version="0.0.1")

origins = [
    "http://localhost:3000",
    "https://dublin-drunk-blond-sudden.trycloudflare.com"
]
# Configuración de CORS (Vital para que tu frontend se comunique)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(algoritmos_router, prefix="/api/v1/algoritmos", tags=["algoritmos"])


#############################################################################
################################################## CODIGO TEMPORAL ##########
#############################################################################

print("Cargando modelo de lenguaje...")
nlp = spacy.load("es_core_news_lg")

# Adaptamos la función para que muestre ejemplos de comentarios en el JSON
def build_tree_dict_kmeans(node, cluster_texts):
    if node.is_leaf():
        # Tomamos hasta 3 comentarios de ejemplo para este clúster
        ejemplos = cluster_texts.get(node.id, ["Sin ejemplos"])[:3]
        # Usamos un fragmento del primer comentario como nombre representativo en el gráfico
        nombre_corto = ejemplos[0][:40] + "..." if ejemplos else f"Grupo {node.id}"
        return {
            "name": nombre_corto,
            "ejemplos": ejemplos, # El frontend (Next.js) puede usar esto para un Tooltip (Hover)
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

@app.get("/api/v1/clustering/dendrograma-local")
async def generar_dendrograma_desde_csv():
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
            
        # Filtramos nulos y nos quedamos con comentarios únicos para no procesar duplicados exactos
        comentarios_unicos = df["COMENTARIO"].dropna().astype(str).unique().tolist()
        
        # Opcional: Filtrar comentarios muy cortos (menos de 2 palabras) o letras sueltas
        comentarios_validos = [c for c in comentarios_unicos if len(c.split()) > 1]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al leer el CSV: {str(e)}")

    if len(comentarios_validos) < 10:
         raise HTTPException(status_code=400, detail="Muy pocos comentarios válidos.")

    # 1. FASE A: VECTORIZACIÓN DE DOCUMENTOS (COMENTARIOS COMPLETOS)
    vectores = []
    textos_procesados = []
    
    # Usamos nlp.pipe que es muchísimo más rápido para procesar listas grandes
    # Desactivamos 'parser' y 'ner' porque solo queremos los vectores, ahorrando mucha RAM
    for doc in nlp.pipe(comentarios_validos, batch_size=2000, disable=["parser", "ner"]):
        if doc.has_vector:
            vectores.append(doc.vector)
            textos_procesados.append(doc.text)

    X = np.array(vectores)

    # 2. FASE B: PRE-CLUSTERING LINEAL (Reducir 238k a 500 grupos manejables)
    # MiniBatchKMeans es ultra rápido y consume muy poca memoria
    n_clusters = min(500, len(X)) # Generamos máximo 500 grupos
    kmeans = MiniBatchKMeans(n_clusters=n_clusters, random_state=42, batch_size=2048, n_init='auto')
    kmeans.fit(X)
    
    # Obtenemos los vectores centrales de esos 500 grupos
    centroides = kmeans.cluster_centers_

    # Mapeamos qué comentarios pertenecen a qué clúster para mostrarlos luego
    textos_por_cluster = {i: [] for i in range(n_clusters)}
    for texto, label in zip(textos_procesados, kmeans.labels_):
        if len(textos_por_cluster[label]) < 10: # Guardamos max 10 ejemplos por grupo para no saturar el JSON
            textos_por_cluster[label].append(texto)

    # 3. FASE C: DENDROGRAMA SOBRE LOS CENTROIDES
    # MODIFICADO: Cambiamos 'ward' por 'average' para respetar la distancia coseno
    distancias_condensadas = pdist(centroides, metric='cosine')
    matriz_linkage = fastcluster.linkage(distancias_condensadas, method='average')
    
    # 4. CONSTRUCCIÓN DEL ÁRBOL PARA NEXT.JS
    root_node, _ = hierarchy.to_tree(matriz_linkage, rd=True)
    arbol_json = build_tree_dict_kmeans(root_node, textos_por_cluster)

    return {
        "metadata": {
            "comentarios_unicos_validos": len(comentarios_validos),
            "comentarios_vectorizados": len(textos_procesados),
            "nodos_hoja_dendrograma": n_clusters,
            "metodo": "Spacy + MiniBatchKMeans + Average Linkage (Coseno)" # MODIFICADO
        },
        "dendrograma": arbol_json
    }