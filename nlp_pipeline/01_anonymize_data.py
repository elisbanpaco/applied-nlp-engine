import json
import logging
import re
import sys
from pathlib import Path
import pandas as pd
import spacy

# Configuración de rutas y logging
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))
OUTPUTS_DIR = Path(__file__).parent / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Cargamos spaCy con el NER activo para la desidentificación
try:
    nlp = spacy.load("es_core_news_lg")
    logger.info("Modelo spaCy (con NER activo) cargado correctamente para anonimización.")
except OSError:
    logger.error("Modelo no encontrado. Ejecuta: uv run python -m spacy download es_core_news_lg")
    sys.exit(1)

# =========================================================================
# COMPONENTE REGEX: Patrones de Identificación Numérica y de Contacto
# =========================================================================
PATRONES_PII = {
    # Correos electrónicos estándares
    "EMAIL": re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'),
    
    # Números de teléfono (Formatos comunes en Perú: 9XXXXXXXX, +51..., ó fijos)
    "TELEFONO": re.compile(r'(?:\+?51\s?)?(?:9\d{8}|\d{2,3}\s?\d{6,7})'),
    
    # Documentos de Identidad comunes (DNI de 8 dígitos, RUC de 11 dígitos)
    "DOCUMENTO_IDENTIDAD": re.compile(r'\b\d{8}\b|\b\d{11}\b'),
    
    # Códigos de Títulos Registrales o Solicitudes (Formatos numéricos largos típicos de SUNARP)
    "CODIGO_REGISTRAL": re.compile(r'\b\d{4}-\d{4}-\d{4,}\b|\b\d{6,10}\b')
}

def anonymize_text_pipeline(text: str) -> str:
    """
    Pipeline híbrido (RegEx + NER) para anonimizar comentarios eliminando PII.
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    # ---- FASE 1: Limpieza por patrones RegEx (Estructuras rígidas) ----
    text_anonymized = text
    for token_placeholder, regex_pattern in PATRONES_PII.items():
        text_anonymized = regex_pattern.sub(f"[{token_placeholder}]", text_anonymized)

    # ---- FASE 2: Limpieza por NER de spaCy (Modelos semánticos para nombres) ----
    doc = nlp(text_anonymized)
    
    # Recorremos las entidades detectadas en orden inverso para evitar conflictos con los índices de caracteres
    tokens_entidades = sorted(doc.ents, key=lambda e: e.start_char, reverse=True)
    
    for ent in tokens_entidades:
        # Filtramos estrictamente nombres de personas (PER)
        if ent.label_ == "PER":
            text_anonymized = text_anonymized[:ent.start_char] + "[PERSONA]" + text_anonymized[ent.end_char:]
            
    return text_anonymized

if __name__ == "__main__":
    DATASET_PATH = PROJECT_ROOT / "api/data" / "REP_COMENTARIO2.csv"
    
    logger.info("Iniciando carga del corpus bruto...")
    comentarios_brutos = []
    comentario_actual = ""
    
    try:
        # Reutilizamos tu algoritmo senior de reconstrucción de buffers para no romper la paridad
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

        df_bruto = pd.DataFrame({"COMENTARIO": comentarios_brutos})
        df_limpio = df_bruto.dropna().drop_duplicates()
        comentarios_filtrados = [c for c in df_limpio["COMENTARIO"].astype(str).tolist() if len(c.split()) > 1]
        
        logger.info(f"Total comentarios listos para el proceso de anonimización: {len(comentarios_filtrados)}")

        # ---- EJECUCIÓN DEL PIPELINE DE ANONIMIZACIÓN ----
        logger.info("Aplicando desidentificación masiva (Fase 1: Patrones RegEx)...")
        comentarios_regex = []
        for c in comentarios_filtrados:
            text_anonymized = c
            for token_placeholder, regex_pattern in PATRONES_PII.items():
                text_anonymized = regex_pattern.sub(f"[{token_placeholder}]", text_anonymized)
            comentarios_regex.append(text_anonymized)

        logger.info("Aplicando desidentificación masiva (Fase 2: NER en batch con spaCy)...")
        comentarios_anonimizados = []
        
        # Procesamos usando nlp.pipe de manera eficiente en batch (NER activo, parser y lemmatizer desactivados)
        for doc in nlp.pipe(comentarios_regex, batch_size=2000, disable=["parser", "lemmatizer"]):
            text_anonymized = doc.text
            # Recorremos las entidades PER detectadas de atrás hacia adelante para no alterar los índices de caracteres
            for ent in sorted(doc.ents, key=lambda e: e.start_char, reverse=True):
                if ent.label_ == "PER":
                    text_anonymized = text_anonymized[:ent.start_char] + "[PERSONA]" + text_anonymized[ent.end_char:]
            comentarios_anonimizados.append(text_anonymized)

        # Contamos cuántas sustituciones aproximadas se hicieron para nuestro reporte técnico
        total_anonimos = sum(1 for c in comentarios_anonimizados if "[" in c and "]" in c)
        
        reporte_anonimizacion = {
            "metricas_privacidad": {
                "total_documentos_procesados": len(comentarios_anonimizados),
                "documentos_con_pii_detectado_y_removido": total_anonimos,
                "porcentaje_documentos_protegidos": round((total_anonimos / len(comentarios_anonimizados)) * 100, 2)
            }
        }

        # Guardamos el reporte ético
        reporte_path = OUTPUTS_DIR / "anonymization_report.json"
        with open(reporte_path, 'w', encoding='utf-8') as f:
            json.dump(reporte_anonimizacion, f, indent=4)
            
        # Guardamos el nuevo dataset limpio y anonimizado para que sea el que use tu API en producción
        dataset_salida_path = PROJECT_ROOT / "api/data" / "REP_COMENTARIO2_ANONYMOUS.csv"
        df_salida = pd.DataFrame({"comentario": comentarios_anonimizados})
        df_salida.to_csv(dataset_salida_path, index=False, header=False, sep=';', encoding='utf-8')

        logger.info(f"Reporte de privacidad guardado exitosamente en: {reporte_path}")
        logger.info(f"NUEVO DATASET SEGURO GUARDADO EN: {dataset_salida_path}")

    except FileNotFoundError:
        logger.error(f"No se encontró el archivo base en: {DATASET_PATH}")
        sys.exit(1)