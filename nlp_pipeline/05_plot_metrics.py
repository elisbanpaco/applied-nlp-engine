import json
import logging
import matplotlib.pyplot as plt
from pathlib import Path

# Configuración de rutas
PIPELINE_DIR = Path(__file__).parent
OUTPUTS_DIR = PIPELINE_DIR / "outputs"
JSON_PATH = OUTPUTS_DIR / "hyperparameter_tuning.json"
PLOT_PATH = OUTPUTS_DIR / "elbow_method_plot.png"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

def plot_metrics():
    if not JSON_PATH.exists():
        logger.error(f"No se encontró el archivo de datos en: {JSON_PATH}")
        return

    # 1. Cargar Datos del Experimento Real
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    k_values = [item['k'] for item in data]
    inertia = [item['inertia'] for item in data]
    silhouette = [item['silhouette_score'] for item in data]

    # 2. Configurar el gráfico de doble eje (Estilo Publicación Académica)
    fig, ax1 = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor('white') # Fondo blanco para inserción limpia en LaTeX/Word [cite: 1]
    
    # Eje Izquierdo: Inercia (Método del Codo)
    color1 = '#1f77b4'  # Azul corporativo/académico limpio
    ax1.set_xlabel('Espacio Paramétrico de Centroides (k)', fontsize=12, fontweight='bold', labelpad=10)
    ax1.set_ylabel('Inercia Global (Menor es mejor)', color=color1, fontsize=12, fontweight='bold')
    line1 = ax1.plot(k_values, inertia, color=color1, marker='o', markersize=8, linewidth=2, label='Inercia (Elbow Method)')
    ax1.tick_params(axis='y', labelcolor=color1)
    ax1.grid(True, linestyle='--', alpha=0.5)

    # Crear el segundo eje Y (Compartiendo el mismo eje X)
    ax2 = ax1.twinx()  
    color2 = '#d62728'  # Rojo académico balanceado
    ax2.set_ylabel('Silhouette Score (Mayor es mejor)', color=color2, fontsize=12, fontweight='bold')  
    line2 = ax2.plot(k_values, silhouette, color=color2, marker='s', markersize=8, linestyle='--', linewidth=2, label='Silhouette Score')
    ax2.tick_params(axis='y', labelcolor=color2)

    # 3. Anotación Científica del Óptimo Matemático (k = 127)
    # Buscamos dinámicamente las coordenadas del pico de Silhouette
    idx_optimo = silhouette.index(max(silhouette))
    k_optimo = k_values[idx_optimo]
    sil_optima = silhouette[idx_optimo]
    
    # Dibujamos una línea vertical punteada en el óptimo
    ax1.axvline(x=k_optimo, color='green', linestyle=':', linewidth=1.5, alpha=0.8)
    
    # Colocamos un cuadro de texto apuntando al máximo local
    ax2.annotate(
        f'Óptimo Semántico\n(k = {k_optimo}, S = {sil_optima:.4f})',
        xy=(k_optimo, sil_optima),
        xytext=(k_optimo + 15, sil_optima - 0.01),
        arrowprops=dict(facecolor='black', shrink=0.08, width=1, headwidth=6),
        fontsize=10,
        fontweight='bold',
        bbox=dict(boxstyle="round,pad=0.3", fc="#e1f5fe", ec="#b3e5fc", alpha=0.9)
    )

    # 4. Título, Ejes y Leyendas Unificadas
    plt.title('Optimización Dinámica de Hiperparámetros en Corpus SUNARP\nAnálisis de Cohesión Espacial e Isometría Semántica (N = 37,937)', fontsize=13, fontweight='bold', pad=20)
    
    # Asegurar que se muestren los ticks exactos evaluados en el eje X
    ax1.set_xticks(k_values)
    
    # Unir las leyendas de ambos ejes en una sola caja limpia
    lines = line1 + line2
    labels = [l.get_label() for l in lines]
    ax1.legend(lines, labels, loc='upper right', frameon=True, facecolor='white', edgecolor='none')

    # Ajustar diseño geométrico y exportar en alta resolución
    fig.tight_layout()
    plt.savefig(PLOT_PATH, dpi=300, bbox_inches='tight')
    logger.info(f"Gráfico de grado de publicación exportado con éxito en: {PLOT_PATH}")

if __name__ == "__main__":
    logger.info("Generando gráfico científico de hiperparámetros...")
    try:
        import matplotlib
        plot_metrics()
    except ImportError:
        logger.error("Falta matplotlib. Ejecuta: uv pip install matplotlib")