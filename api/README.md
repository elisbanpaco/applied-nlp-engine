# Applied NLP Engine - API

FastAPI backend for Spanish text processing, similarity analysis, and hierarchical clustering visualization.

![Python](https://img.shields.io/badge/Python-3.13+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-00a?logo=fastapi)
![spaCy](https://img.shields.io/badge/spaCy-3.8+-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

REST API providing NLP capabilities for Spanish text analysis:
- **Text similarity**: Cosine similarity and Jaccard index for comparing documents
- **Semantic embeddings**: spaCy Spanish models (es_core_news_lg)
- **Scalable clustering**: MiniBatchKMeans for handling 200k+ documents
- **Hierarchical clustering**: Dendrogram generation with dendro visualization support

## Tech Stack

| Package | Purpose |
|---------|---------|
| FastAPI | Async web framework |
| spaCy | Spanish NLP & embeddings |
| scikit-learn | MiniBatchKMeans clustering |
| SciPy | Hierarchical clustering |
| fastcluster | Optimized linkage computation |
| Pandas | CSV processing |
| NumPy | Numerical operations |

## Quick Start

```bash
# Install dependencies (uv recommended)
cd api
uv sync

# Or with pip
pip install -e .

# Download Spanish models
python -m spacy download es_core_news_lg
python -m spacy download es_core_news_md

# Run server
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

## Project Structure

```
api/
├── core/
│   ├── distancia_coseno.py         # Cosine similarity (2 texts)
│   ├── distancia_coseno_with_dataset.py  # Clustering pipeline
│   ├── jaccard.py                   # Jaccard similarity
│   └── jaccard_with_dataset.py       # Jaccard clustering
├── routes/
│   ├── algoritmos.py             # Text comparison endpoints
│   └── route_algorithm_with_dataset.py  # Clustering endpoints
├── schemas/
│   └── data_models.py           # Pydantic models
├── data/
│   └── REP_COMENTARIO2.csv      # 250k Spanish comments
├── main.py                      # FastAPI app entry
└── pyproject.toml               # uv/dependencies config
```

## API Endpoints

### Text Similarity (1-vs-1)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/algoritmos/comparar-textos-distancia-coseno` | POST | Cosine similarity |
| `/api/v1/algoritmos/comparar-textos-jaccard` | POST | Jaccard index |

**Request body:**
```json
{
  "textoA": "El servicio es excelente",
  "textoB": "Muy buen servicio"
}
```

**Response:**
```json
{
  "message": "Datos enviados correctamente",
  "similarity": 0.85,
  "palabrasA": ["servicio", "excelente"],
  "palabrasB": ["servicio", "buen"],
  "textoA": "El servicio es excelente",
  "textoB": "Muy buen servicio"
}
```

### Clustering

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/clustering/distancia-coseno` | GET | Dendrogram with cosine |
| `/api/v1/clustering/jaccard` | GET | Dendrogram with Jaccard |

**Response:**
```json
{
  "metadata": {
    "comentarios_unicos_validos": 238492,
    "comentarios_vectorizados": 238492,
    "nodos_hoja_dendrograma": 500,
    "metodo": "Spacy + MiniBatchKMeans + Average Linkage (Coseno)"
  },
  "dendrograma": {
    "name": "Macro_Cluster_999",
    "distancia": 0.8234,
    "children": [...]
  }
}
```

## How It Works

### Similarity Algorithms

**Cosine Similarity**: 
- Uses spaCy semantic embeddings (300-dim vectors)
- Averages word vectors excluding stopwords
- Computes dot product / (norms product)

**Jaccard Index**:
- Lemmatizes and cleans text via spaCy
- Creates binary word sets
- Computes |A ∩ B| / |A ∪ B|

### Clustering Pipeline

1. **Text Vectorization**: spaCy `nlp.pipe()` with batch_size=2000
2. **Pre-clustering**: MiniBatchKMeans reduces 200k → 500 groups
3. **Hierarchical**: fastcluster with average linkage
4. **Output**: JSON tree for Plotly.js dendrogram

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_HOST` | Server host | `0.0.0.0` |
| `API_PORT` | Server port | `8000` |

## Development

```bash
# Code style check
ruff check .

# Format
ruff format .

# Run tests (if available)
pytest
```

## License

MIT - See [../LICENSE](../LICENSE)