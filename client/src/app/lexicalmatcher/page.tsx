"use client";

import { useState, useEffect, useRef } from "react";
import { Zap, Timer, Download, Loader2, SkipBack, Play, Pause, SkipForward, ChevronRight } from "lucide-react";

interface CosineResponse {
  message: string;
  similarity: number;
  palabrasA: string[];
  palabrasB: string[];
  textoA: string;
  textoB: string;
}

interface JaccardResponse {
  message: string;
  similarity: number;
  conjuntoA: string[];
  conjuntoB: string[];
}

interface AlgorithmResult {
  type: string;
  value: number;
}

interface ApiResponse {
  computation_id: string;
  timestamp: string;
  algorithms: AlgorithmResult[];
  tokens: {
    source_count: number;
    comparison_count: number;
    overlap: number;
  };
  status: string;
}

type StepData = {
  title: string;
  description: string;
  content: React.ReactNode;
};

interface AlgorithmViewerProps {
  jaccardData: JaccardResponse | null;
  cosineData: CosineResponse | null;
  algorithm: "jaccard" | "cosine";
  textoA: string;
  textoB: string;
}

function AlgorithmViewer({ jaccardData, cosineData, algorithm, textoA, textoB }: AlgorithmViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const data = algorithm === "jaccard" ? jaccardData : cosineData;

  const getSteps = (): StepData[] => {
    if (!data) return [];

    if (algorithm === "jaccard") {
      const jaccard = data as JaccardResponse;
      return [
        {
          title: "Conjuntos Iniciales",
          description: "Identificamos los conjuntos de palabras únicas de cada texto",
          content: (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-neutral-800/50 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Conjunto A</p>
                <p className="text-sm font-mono text-neutral-300">{textoA}</p>
              </div>
              <div className="bg-neutral-800/50 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Conjunto B</p>
                <p className="text-sm font-mono text-neutral-300">{textoB}</p>
              </div>
            </div>
          ),
        },
        {
          title: "Desglose de Tokens",
          description: "Obtenemos los conjuntos de palabras únicas de cada texto",
          content: (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-neutral-800/50 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Conjunto A ({jaccard.conjuntoA.length} palabras)</p>
                <div className="flex flex-wrap gap-2">
                  {jaccard.conjuntoA.map((word, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-mono rounded">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-neutral-800/50 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Conjunto B ({jaccard.conjuntoB.length} palabras)</p>
                <div className="flex flex-wrap gap-2">
                  {jaccard.conjuntoB.map((word, i) => (
                    <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-mono rounded">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-2 bg-neutral-900 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Fórmula Jaccard</p>
                <p className="font-mono text-sm text-neutral-300">Similarity = |A ∩ B| / |A ∪ B|</p>
              </div>
            </div>
          ),
        },
        {
          title: "Resultado Final",
          description: "El coeficiente de similitud de Jaccard",
          content: (
            <div className="space-y-4">
              <div className="bg-neutral-800/50 p-6 rounded-sm text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Similarity Score</p>
                <p className="text-5xl font-black text-white">{Math.round(jaccard.similarity * 100 * 10) / 10}%</p>
              </div>
              <div className="bg-neutral-900 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Mensaje</p>
                <p className="text-sm text-neutral-300">{jaccard.message}</p>
              </div>
            </div>
          ),
        },
      ];
    } else {
      const cosine = data as CosineResponse;
      return [
        {
          title: "Textos Iniciales",
          description: "Los textos originales que vamos a comparar",
          content: (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-neutral-800/50 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Texto A</p>
                <p className="text-sm font-mono text-neutral-300">{textoA}</p>
              </div>
              <div className="bg-neutral-800/50 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Texto B</p>
                <p className="text-sm font-mono text-neutral-300">{textoB}</p>
              </div>
            </div>
          ),
        },
        {
          title: "Tokenización",
          description: "Dividimos cada texto en palabras individuales",
          content: (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-neutral-800/50 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Palabras A ({cosine.palabrasA.length})</p>
                <div className="flex flex-wrap gap-2">
                  {cosine.palabrasA.map((word, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-mono rounded">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-neutral-800/50 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Palabras B ({cosine.palabrasB.length})</p>
                <div className="flex flex-wrap gap-2">
                  {cosine.palabrasB.map((word, i) => (
                    <span key={i} className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs font-mono rounded">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-2 bg-neutral-900 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Fórmula Coseno</p>
                <p className="font-mono text-sm text-neutral-300">Similarity = (A · B) / (||A|| × ||B||)</p>
              </div>
            </div>
          ),
        },
        {
          title: "Resultado Final",
          description: "La similitud coseno entre los vectores de términos",
          content: (
            <div className="space-y-4">
              <div className="bg-neutral-800/50 p-6 rounded-sm text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Cosine Similarity</p>
                <p className="text-5xl font-black text-white">{Math.round(cosine.similarity * 100 * 10) / 10}%</p>
              </div>
              <div className="bg-neutral-900 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Mensaje</p>
                <p className="text-sm text-neutral-300">{cosine.message}</p>
              </div>
            </div>
          ),
        },
      ];
    }
  };

  const steps = getSteps();
  const totalSteps = steps.length - 1;

  useEffect(() => {
    if (!isPlaying || currentStep >= totalSteps) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, totalSteps]);

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepForward = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkipForward = () => {
    setCurrentStep(totalSteps);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (currentStep >= totalSteps) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  if (!data) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="mt-8 border-t border-neutral-800/40 pt-8">
      <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-neutral-500">
        Paso a Paso - {algorithm === "jaccard" ? "Jaccard" : "Cosine"}
      </h3>

      <div className="bg-neutral-900 rounded-sm overflow-hidden border border-neutral-800/40">
        <div className="bg-neutral-800 px-4 py-3 border-b border-neutral-700/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-400">Step</span>
            <span className="text-sm font-bold text-white">{currentStep + 1} / {steps.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStepBack}
              disabled={currentStep === 0}
              className="p-2 rounded-sm hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Step Back"
            >
              <SkipBack className="w-4 h-4 text-neutral-300" />
            </button>
            <button
              onClick={togglePlay}
              className="p-2 rounded-sm hover:bg-neutral-700 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={handleStepForward}
              disabled={currentStep >= totalSteps}
              className="p-2 rounded-sm hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Step Forward"
            >
              <ChevronRight className="w-4 h-4 text-neutral-300" />
            </button>
            <button
              onClick={handleSkipForward}
              disabled={currentStep >= totalSteps}
              className="p-2 rounded-sm hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Skip to End"
            >
              <SkipForward className="w-4 h-4 text-neutral-300" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-white mb-1">{currentStepData.title}</h4>
            <p className="text-sm text-neutral-400">{currentStepData.description}</p>
          </div>
          <div className="mt-4">{currentStepData.content}</div>
        </div>

        <div className="px-6 pb-4 flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= currentStep ? "bg-blue-400" : "bg-neutral-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LexicalMatcher() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [textoA, setTextoA] = useState("");
  const [textoB, setTextoB] = useState("");
  const [algorithm, setAlgorithm] = useState<"jaccard" | "cosine">("jaccard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [jaccardData, setJaccardData] = useState<JaccardResponse | null>(null);
  const [cosineData, setCosineData] = useState<CosineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!textoA.trim() || !textoB.trim()) {
      setError("Please enter both texts to compare");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const [jaccardRes, cosineRes] = await Promise.all([
        fetch(`${baseUrl}/api/v1/algoritmos/comparar-textos-jaccard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ textoA, textoB }),
        }),
        fetch(`${baseUrl}/api/v1/algoritmos/comparar-textos-distancia-coseno`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ textoA, textoB }),
        }),
      ]);

      let jaccardValue = 0;
      let cosineValue = 0;

      if (!jaccardRes.ok) {
        const errorData = await jaccardRes.json();
        throw new Error(errorData.detail?.[0]?.msg || "Failed to calculate Jaccard similarity");
      }
      const jaccardData: JaccardResponse = await jaccardRes.json();
      jaccardValue = jaccardData.similarity;

      if (!cosineRes.ok) {
        const errorData = await cosineRes.json();
        throw new Error(errorData.detail?.[0]?.msg || "Failed to calculate Cosine similarity");
      }
      const cosineData: CosineResponse = await cosineRes.json();
      cosineValue = cosineData.similarity;

      const combinedResult: ApiResponse = {
        computation_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        algorithms: [
          { type: "jaccard", value: jaccardValue },
          { type: "cosine_similarity", value: cosineValue },
        ],
        tokens: {
          source_count: textoA.split(/\s+/).filter(Boolean).length,
          comparison_count: textoB.split(/\s+/).filter(Boolean).length,
          overlap: 0,
        },
        status: "completed",
      };

      setResult(combinedResult);
      setJaccardData(jaccardData);
      setCosineData(cosineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getScore = () => {
    if (!result) return 0;
    const algo = result.algorithms.find(
      (a) => a.type === algorithm || a.type === (algorithm === "cosine" ? "cosine_similarity" : "jaccard")
    );
    return algo ? Math.round(algo.value * 100 * 10) / 10 : 0;
  };

  const getJaccardScore = () => {
    if (!result) return "0.00";
    const algo = result.algorithms.find((a) => a.type === "jaccard");
    return algo ? algo.value.toFixed(2) : "0.00";
  };

  const getCosineScore = () => {
    if (!result) return "0.00";
    const algo = result.algorithms.find(
      (a) => a.type === "cosine" || a.type === "cosine_similarity"
    );
    return algo ? algo.value.toFixed(2) : "0.00";
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-['Inter'] mt-16">
      <div className="ml-64 flex flex-col flex-1 min-h-screen">
        <main className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono bg-neutral-800 px-2 py-0.5 rounded text-neutral-200">
                ENGINE_V1
              </span>
              <span className="text-[10px] font-mono text-blue-400 tracking-widest uppercase">
                Operational
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tighter mb-4 text-neutral-200">
              Lexical Matcher
            </h2>
            <p className="text-neutral-500 max-w-2xl leading-relaxed">
              Execute precise string comparison using Jaccard Similarity and
              Cosine Similarity algorithms. Optimized for large-scale text
              corpus validation and automated diffing.
            </p>
          </div>

          <div className="p-5">
            <label className="block text-[10px] uppercase tracking-widest font-bold 
              text-gray-700 dark:text-gray-300 mb-2">
              Select Algorithm
            </label>

            <div className="relative group">
              <select
                value={algorithm}
                onChange={(e) =>
                  setAlgorithm(e.target.value as "jaccard" | "cosine")
                }
                className="
                  w-full 
                  bg-gray-100 dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  border border-gray-300 dark:border-gray-600
                  text-sm py-2.5 px-4 
                  focus:ring-1 focus:ring-purple-400 dark:focus:ring-purple-500
                  rounded-sm appearance-none transition-all
                "
              >
                <option value="jaccard">Jaccard Similarity</option>
                <option value="cosine">Cosine Similarity</option>
              </select>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="group relative bg-neutral-900 p-6 rounded-sm transition-all hover:bg-neutral-800">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                  Source Text (A)
                </label>
                <span className="text-[10px] font-mono text-neutral-600">
                  Chars: {textoA.length.toLocaleString()}
                </span>
              </div>
              <textarea
                value={textoA}
                onChange={(e) => setTextoA(e.target.value)}
                className="w-full h-64 bg-transparent border-none p-0 text-sm font-mono leading-relaxed focus:ring-0 resize-none placeholder:text-neutral-700 outline-none text-neutral-200"
                placeholder="Paste your reference source code or natural language string here..."
              />
            </div>

            <div className="group relative bg-neutral-900 p-6 rounded-sm transition-all hover:bg-neutral-800">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                  Comparison Text (B)
                </label>
                <span className="text-[10px] font-mono text-neutral-600">
                  Chars: {textoB.length.toLocaleString()}
                </span>
              </div>
              <textarea
                value={textoB}
                onChange={(e) => setTextoB(e.target.value)}
                className="w-full h-64 bg-transparent border-none p-0 text-sm font-mono leading-relaxed focus:ring-0 resize-none placeholder:text-neutral-700 outline-none text-neutral-200"
                placeholder="Paste the text to be analyzed for lexical overlap..."
              />
            </div>
          </section>

          <div className="flex flex-col items-center gap-6 mb-16">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="group relative flex items-center justify-center gap-3 px-12 py-4 bg-white text-black font-bold rounded-sm overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-3 uppercase tracking-tighter">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                {loading ? "Computing..." : "Run Computation"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white via-neutral-300 to-white opacity-20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                GPU Accelerated
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
                <Timer className="w-3 h-3" />
                ~12ms latency
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-sm text-red-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-12">
              <div className="border-t border-neutral-800/40 pt-8">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-8 text-neutral-500">
                  Analysis Results
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
                  <div className="col-span-1 space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest mb-1 text-neutral-500">
                        Global Similarity Score
                      </p>
                      <div className="flex items-end gap-2">
                        <span className="text-6xl font-black tracking-tighter text-white">
                          {getScore()}
                        </span>
                        <span className="text-2xl font-bold text-neutral-500 mb-1">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-[2px] bg-neutral-800 relative">
                      <div
                        className="absolute h-full bg-blue-400"
                        style={{ width: `${getScore()}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-900 p-4 rounded-sm">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                          Jaccard
                        </p>
                        <p className="font-mono text-lg text-neutral-200">
                          {getJaccardScore()}
                        </p>
                      </div>
                      <div className="bg-neutral-900 p-4 rounded-sm">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                          Cosine
                        </p>
                        <p className="font-mono text-lg text-neutral-200">
                          {getCosineScore()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 bg-neutral-950 rounded-sm overflow-hidden border border-neutral-800/40">
                    <div className="bg-neutral-800 px-4 py-2 flex items-center justify-between border-b border-neutral-700/40">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">
                        raw_output.json
                      </span>
                      <button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(result, null, 2)], {
                            type: "application/json",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "comparison_result.json";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="text-neutral-500 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 font-mono text-xs leading-relaxed text-blue-200/80 overflow-x-auto">
                      <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  </div>
                </div>

                <AlgorithmViewer
                  jaccardData={jaccardData}
                  cosineData={cosineData}
                  algorithm={algorithm}
                  textoA={textoA}
                  textoB={textoB}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
