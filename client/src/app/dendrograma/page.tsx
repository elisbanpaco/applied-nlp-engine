'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Importar Plotly dinámicamente para evitar problemas de SSR
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DendrogramNode {
  name: string;
  distancia?: number;
  children?: DendrogramNode[];
  ejemplos?: string[];
  value?: number;
}

interface DendrogramData {
  metadata: {
    comentarios_unicos_validos: number;
    comentarios_vectorizados: number;
    nodos_hoja_dendrograma: number;
    metodo: string;
  };
  dendrograma: DendrogramNode;
}

interface DendrogramCoords {
  icoord: number[][];
  dcoord: number[][];
  labels: string[];
  labelCoords: { x: number; label: string }[];
}

export default function DendrogramPage() {
  const [data, setData] = useState<DendrogramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para convertir el árbol jerárquico a coordenadas de dendrograma
  const treeToCoords = (node: DendrogramNode): DendrogramCoords => {
    const icoord: number[][] = [];
    const dcoord: number[][] = [];
    const labels: string[] = [];
    const labelCoords: { x: number; label: string }[] = [];
    let leafPosition = 0;

    const traverse = (
      currentNode: DendrogramNode,
      height: number = 0
    ): { left: number; right: number; x: number } => {
      if (!currentNode.children || currentNode.children.length === 0) {
        // Nodo hoja
        const x = leafPosition * 10 + 5;
        leafPosition++;
        
        const label = currentNode.name.length > 20 
          ? currentNode.name.substring(0, 17) + '...' 
          : currentNode.name;
        
        labels.push(label);
        labelCoords.push({ x, label });
        
        return { left: x, right: x, x };
      }

      // Nodo interno - procesar hijos
      const childResults = currentNode.children.map(child => 
        traverse(child, (currentNode.distancia || 0) * 50)
      );

      const leftmost = childResults[0].left;
      const rightmost = childResults[childResults.length - 1].right;
      const center = (leftmost + rightmost) / 2;
      const nodeHeight = (currentNode.distancia || 0) * 50;

      // Dibujar líneas del dendrograma
      // Primero, líneas verticales desde cada hijo hasta la altura actual
      childResults.forEach(child => {
        icoord.push([child.x, child.x]);
        dcoord.push([height, nodeHeight]);
      });

      // Luego, línea horizontal conectando todos los hijos
      if (childResults.length >= 2) {
        icoord.push([leftmost, rightmost]);
        dcoord.push([nodeHeight, nodeHeight]);
      }

      return { left: leftmost, right: rightmost, x: center };
    };

    traverse(node);

    return { icoord, dcoord, labels, labelCoords };
  };

  // Crear las trazas de Plotly para el dendrograma
  const createDendrogramTraces = (treeData: DendrogramNode) => {
    const { icoord, dcoord, labelCoords } = treeToCoords(treeData);
    const traces: any[] = [];

    // Traza para las líneas del dendrograma
    icoord.forEach((xcoords, idx) => {
      traces.push({
        type: 'scatter',
        // x: xcoords,
        // y: dcoord[idx],
        x: dcoord[idx],
        y: xcoords,
        mode: 'lines',
        line: {
          color: '#000000',
          width: 1.5
        },
        hoverinfo: 'skip',
        showlegend: false
      });
    });

    // Agregar etiquetas en el eje X
    const labelTrace = {
      type: 'scatter',
      // x: labelCoords.map(l => l.x),
      // y: Array(labelCoords.length).fill(0),
      x: Array(labelCoords.length).fill(0),
      y: labelCoords.map(l => l.x),
      mode: 'text',
      text: labelCoords.map(l => l.label),
      // textposition: 'bottom',
      // textangle: -90,
      textposition: 'middle left',
      textangle: 0,
      textfont: {
        size: 10,
        family: 'Arial, sans-serif',
        color: '#000000'
      },
      hoverinfo: 'text',
      hovertext: labelCoords.map(l => l.label),
      showlegend: false
    };
    
    traces.push(labelTrace);

    return traces;
  };

  // Simular carga de datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // REEMPLAZA ESTA URL CON TU ENDPOINT DE FASTAPI
        const response = await fetch('http://localhost:8000/api/v1/clustering/distancia-coseno');
        if (!response.ok) throw new Error('Error al obtener datos');
        const jsonData = await response.json();
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando dendrograma...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-4 font-semibold">Error al cargar datos</p>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Dendrograma de Clustering Jerárquico
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Método: <span className="font-mono font-semibold">{data.metadata.metodo}</span>
          </p>
        </div>
      </header>

      {/* Metadata Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-1">
              Comentarios Únicos Válidos
            </p>
            <p className="text-3xl font-bold text-blue-900">
              {data?.metadata?.comentarios_unicos_validos?.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-purple-700 font-semibold mb-1">
              Comentarios Vectorizados
            </p>
            <p className="text-3xl font-bold text-purple-900">
              {data?.metadata?.comentarios_vectorizados?.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-green-700 font-semibold mb-1">
              Nodos Hoja
            </p>
            <p className="text-3xl font-bold text-green-900">
              {data?.metadata.nodos_hoja_dendrograma}
            </p>
          </div>
        </div>

        {/* Dendrograma */}
        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Visualización del Clustering
            </h2>
            <p className="text-sm text-gray-600">
              Dendrograma generado mediante clustering jerárquico aglomerativo con método Ward
            </p>
          </div>
          
          <div className="w-full bg-gray-50 rounded-lg p-4" style={{ height: '850px' }}>
            <Plot
              data={createDendrogramTraces(data.dendrograma)}
              layout={{
                title: {
                  text: 'average',
                  font: {
                    size: 20,
                    family: 'Arial, sans-serif',
                    color: '#000000'
                  },
                  x: 0.5,
                  xanchor: 'center',
                  y: 0.98,
                  yanchor: 'top'
                },
                autosize: true,
                height: 800,
                margin: {
                  // l: 60,
                  l: 250,
                  r: 40,
                  t: 80,
                  // b: 250
                  b: 60
                },
                // xaxis: {
                //   showticklabels: false,
                //   showgrid: false,
                //   zeroline: false,
                //   showline: true,
                //   linecolor: '#000000',
                //   linewidth: 1.5,
                //   ticks: ''
                // },
                // yaxis: {
                //   title: {
                //     text: 'Distancia',
                //     font: {
                //       size: 14,
                //       family: 'Arial, sans-serif'
                //     }
                //   },
                //   showgrid: true,
                //   gridcolor: '#e5e5e5',
                //   gridwidth: 1,
                //   zeroline: true,
                //   showline: true,
                //   linecolor: '#000000',
                //   linewidth: 1.5,
                //   tickfont: {
                //     size: 11,
                //     family: 'Arial, sans-serif'
                //   }
                // },
                xaxis: { // <-- AHORA X ES LA DISTANCIA
                  title: {
                    text: 'Distancia',
                    font: { size: 14, family: 'Arial, sans-serif' }
                  },
                  showgrid: true,
                  gridcolor: '#e5e5e5',
                  gridwidth: 1,
                  zeroline: true,
                  showline: true,
                  linecolor: '#000000',
                  linewidth: 1.5,
                  tickfont: { size: 11, family: 'Arial, sans-serif' }
                },
                yaxis: { // <-- AHORA Y SON LAS ETIQUETAS (OCULTAS)
                  showticklabels: false,
                  showgrid: false,
                  zeroline: false,
                  showline: true,
                  linecolor: '#000000',
                  linewidth: 1.5,
                  ticks: ''
                },
                font: {
                  family: 'Arial, sans-serif',
                  size: 11,
                  color: '#000000'
                },
                paper_bgcolor: '#f9fafb',
                plot_bgcolor: '#ffffff',
                hovermode: 'closest',
                showlegend: false
              }}
              config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
                toImageButtonOptions: {
                  format: 'png',
                  filename: 'dendrograma_clustering',
                  height: 1000,
                  width: 1600,
                  scale: 2
                }
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
              <span className="text-lg mr-2">💡</span>
              Cómo interpretar el dendrograma
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>El eje Y representa la distancia de agrupación (linkage distance)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Las hojas en el eje X representan los clusters finales</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Mayor altura = mayor disimilaridad entre clusters</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Usa los controles superiores para zoom y descarga</span>
              </li>
            </ul>
          </div>

          {/* Información técnica */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <span className="text-lg mr-2">⚙️</span>
              Detalles técnicos
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="font-semibold">Método de vectorización:</span>
                <span className="font-mono text-xs">Spacy</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="font-semibold">Clustering inicial:</span>
                <span className="font-mono text-xs">MiniBatchKMeans</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="font-semibold">Linkage method:</span>
                <span className="font-mono text-xs">Ward</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold">Total de nodos:</span>
                <span className="font-mono text-xs">{data.metadata.nodos_hoja_dendrograma}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}