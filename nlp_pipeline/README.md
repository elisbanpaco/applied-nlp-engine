# NLP Pipeline — Data Preprocessing & Research

![Python](https://img.shields.io/badge/Python-3.13+-blue?logo=python)
![spaCy](https://img.shields.io/badge/spaCy-3.8+-orange)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8+-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

Offline data pipeline for the Applied NLP Engine: anonymization, corpus analysis, hyperparameter tuning, cluster evaluation, and metric visualization.

## Overview

This pipeline processes raw Spanish text corpora through five sequential stages before the API serves the results. Each stage produces artifacts consumed by the next.

## Pipeline Stages

| Script | Stage | Description |
|--------|-------|-------------|
| `01_anonymize_data.py` | **Anonymization** | Hybrid RegEx + NER (spaCy) pipeline that detects and replaces PII (emails, phones, IDs, person names) with placeholders like `[PERSONA]`, `[EMAIL]` |
| `02_analyze_corpus.py` | **Corpus Analysis** | Extracts linguistic metrics: OOV rate, token frequencies, sentence lengths, vocabulary richness |
| `03_hyperparameter_tuning.py` | **Tuning** | Grid search over `MiniBatchKMeans` `k` values; evaluates inertia and silhouette scores to find the optimal cluster count |
| `04_evaluate_clusters.py` | **Evaluation** | Computes intrinsic metrics (silhouette, Davies–Bouldin) for the chosen configuration, and validates hierarchical clustering quality |
| `05_plot_metrics.py` | **Visualization** | Generates publication-ready plots (e.g., elbow method) saved to `outputs/` |

## Quick Start

```bash
# Install dependencies
cd nlp_pipeline
uv sync

# Download Spanish models
python -m spacy download es_core_news_lg

# Run the full pipeline in order
uv run python 01_anonymize_data.py
uv run python 02_analyze_corpus.py
uv run python 03_hyperparameter_tuning.py
uv run python 04_evaluate_clusters.py
uv run python 05_plot_metrics.py
```

## Outputs

All artifacts are written to `nlp_pipeline/outputs/`:

| File | Description |
|------|-------------|
| `anonymization_report.json` | PII detection statistics |
| `oov_analysis.json` | Out-of-vocabulary analysis |
| `hyperparameter_tuning.json` | Silhouette & inertia per `k` |
| `metricas_reales.json` | Final cluster metrics |
| `elbow_method_plot.png` | Elbow method visualization |

## Dependencies

| Package | Purpose |
|---------|---------|
| spaCy | Spanish NLP & embeddings |
| scikit-learn | MiniBatchKMeans, silhouette score |
| fastcluster | Optimized hierarchical clustering |
| matplotlib | Publication plots |
| pandas | CSV processing |
| numpy | Numerical operations |


## License

MIT — See [../LICENSE](../LICENSE)
