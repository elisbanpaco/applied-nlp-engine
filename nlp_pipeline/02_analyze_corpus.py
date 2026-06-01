import json
import logging
import sys
from pathlib import Path
import pandas as pd
import spacy
from collections import Counter
import numpy as np

# Configuración de rutas y logging
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))
OUTPUTS_DIR = Path(__file__).parent / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    nlp = spacy.load("es_core_news_lg")
    logger.info("Modelo spaCy cargado correctamente.")
except OSError:
    logger.error("Modelo no encontrado.")
    sys.exit(1)

def analyze_corpus_advanced(texts: list) -> dict:
    """
    Analiza el corpus limpio para extraer métricas lingüísticas avanzadas y OOV Rate.
    """
    logger.info("Iniciando análisis avanzado de vocabulario (OOV)...")
    
    total_tokens = 0
    oov_tokens = 0
    oov_counter = Counter()
    longitudes_comentarios = []

    for doc in nlp.pipe(texts, batch_size=2000, disable=["parser", "ner", "lemmatizer"]):
        tokens_informativos_en_doc = 0
        
        for token in doc:
            # Ignoramos signos de puntuación, números y espacios
            if token.is_punct or token.is_space or token.like_num:
                continue
            
            total_tokens += 1
            tokens_informativos_en_doc += 1
            
            # Un token es verdaderamente OOV si ni su forma original ni su versión en minúsculas tienen vector en el vocabulario
            # Esto evita falsos positivos debido a capitalizaciones mixtas del usuario (p.ej., 'mUY', 'EXcelente')
            es_oov = token.is_oov and not nlp.vocab.has_vector(token.text.lower())
            if es_oov:
                oov_tokens += 1
                oov_counter[token.text.lower()] += 1
        
        longitudes_comentarios.append(tokens_informativos_en_doc)

    porcentaje_oov = (oov_tokens / total_tokens) * 100 if total_tokens > 0 else 0

    logger.info(f"Análisis completado. Tokens analizados: {total_tokens} | OOV: {oov_tokens} ({porcentaje_oov:.2f}%)")
    
    return {
        "estadisticas_corpus": {
            "total_documentos_evaluados": len(texts),
            "total_tokens_validos": total_tokens,
            "palabras_fuera_de_vocabulario_oov": oov_tokens,
            "oov_rate_porcentaje": round(porcentaje_oov, 4),
            "longitud_promedio_tokens_informativos": round(float(np.mean(longitudes_comentarios)), 2),
            "longitud_mediana_tokens_informativos": int(np.median(longitudes_comentarios))
        },
        "top_50_errores_o_palabras_oov": oov_counter.most_common(50)
    }

if __name__ == "__main__":
    DATASET_PATH = PROJECT_ROOT / "api/data" / "REP_COMENTARIO2.csv"
    
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
                        c_limpio = comentario_actual.strip()
                        if c_limpio.startswith('"') and c_limpio.endswith('"'):
                            c_limpio = c_limpio[1:-1].strip()
                        comentarios_brutos.append(c_limpio)
                    
                    partes = linea.split(';', 1)
                    comentario_actual = partes[1].strip() if len(partes) > 1 else ""
                else:
                    comentario_actual += " " + linea

        if comentario_actual:
            c_limpio = comentario_actual.strip()
            if c_limpio.startswith('"') and c_limpio.endswith('"'):
                c_limpio = c_limpio[1:-1].strip()
            comentarios_brutos.append(c_limpio)

        # Aplicamos idénticos filtros de producción para evitar sesgo estadístico
        df = pd.DataFrame({"COMENTARIO": comentarios_brutos})
        comentarios_unicos = df["COMENTARIO"].dropna().astype(str).unique().tolist()
        comentarios_validos = [c for c in comentarios_unicos if len(c.split()) > 1]
        
        logger.info(f"Total comentarios listos para análisis lingüístico: {len(comentarios_validos)}")

        # Ejecutamos la radiografía del corpus
        resultados = analyze_corpus_advanced(comentarios_validos)
        
        filepath = OUTPUTS_DIR / "oov_analysis.json"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(resultados, f, indent=4, ensure_ascii=False)
            
        logger.info(f"Reporte OOV y descripción léxica guardados exitosamente en {filepath}")

    except FileNotFoundError:
        logger.error(f"No se encontró el archivo en: {DATASET_PATH}")
        sys.exit(1)