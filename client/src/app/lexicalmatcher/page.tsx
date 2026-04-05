"use client";

import { useState } from "react";

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

export default function LexicalMatcher() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [textoA, setTextoA] = useState("");
  const [textoB, setTextoB] = useState("");
  const [algorithm, setAlgorithm] = useState<"jaccard" | "cosine">("jaccard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
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
      const jaccardData = await jaccardRes.json();
      jaccardValue = jaccardData.similarity !== undefined 
        ? parseFloat(jaccardData.similarity) 
        : parseFloat(jaccardData);

      if (!cosineRes.ok) {
        const errorData = await cosineRes.json();
        throw new Error(errorData.detail?.[0]?.msg || "Failed to calculate Cosine similarity");
      }
      const cosineData = await cosineRes.json();
      cosineValue = cosineData.similarity !== undefined 
        ? parseFloat(cosineData.similarity) 
        : parseFloat(cosineData);

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
                <span className="material-symbols-outlined text-lg">
                  {loading ? "hourglass_empty" : "bolt"}
                </span>
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
                <span className="material-symbols-outlined text-[12px]">
                  timer
                </span>
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
                        <span className="material-symbols-outlined text-sm">
                          download
                        </span>
                      </button>
                    </div>
                    <div className="p-6 font-mono text-xs leading-relaxed text-blue-200/80 overflow-x-auto">
                      <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
