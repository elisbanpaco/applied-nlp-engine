// app/lexical-matcher/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lexical Matcher",
};

export default function LexicalMatcher() {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-['Inter'] mt-16">
      {/* Right column */}
      <div className="ml-64 flex flex-col flex-1 min-h-screen">
        {/* Main */}
        <main className="p-8 max-w-7xl mx-auto w-full">
          {/* Tool Header */}
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
              Levenshtein Distance algorithms. Optimized for large-scale text
              corpus validation and automated diffing.
            </p>
          </div>

          {/* Algorithm Selection */}
          <div className="p-5">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">
              Select Algorithm
            </label>
            <div className="relative group">
              <select className="w-full bg-surface-container-low border-none text-on-surface text-sm py-2.5 px-4 focus:ring-1 focus:ring-tertiary-container rounded-sm appearance-none transition-all">
                <option>Jaccard Similarity</option>
                <option>Cosine Similarity</option>
              </select>
            </div>
          </div>

          {/* Input Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[
              {
                label: "Source Text (A)",
                chars: "1,240",
                placeholder:
                  "Paste your reference source code or natural language string here...",
              },
              {
                label: "Comparison Text (B)",
                chars: "1,192",
                placeholder:
                  "Paste the text to be analyzed for lexical overlap...",
              },
            ].map(({ label, chars, placeholder }) => (
              <div
                key={label}
                className="group relative bg-neutral-900 p-6 rounded-sm transition-all hover:bg-neutral-800"
              >
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                    {label}
                  </label>
                  <span className="text-[10px] font-mono text-neutral-600">
                    Chars: {chars}
                  </span>
                </div>
                <textarea
                  className="w-full h-64 bg-transparent border-none p-0 text-sm font-mono leading-relaxed focus:ring-0 resize-none placeholder:text-neutral-700 outline-none text-neutral-200"
                  placeholder={placeholder}
                />
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-neutral-500 hover:text-white">
                    <span className="material-symbols-outlined text-sm">
                      content_copy
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Action */}
          <div className="flex flex-col items-center gap-6 mb-16">
            <button className="group relative flex items-center justify-center gap-3 px-12 py-4 bg-white text-black font-bold rounded-sm overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95">
              <span className="relative z-10 flex items-center gap-3 uppercase tracking-tighter">
                <span className="material-symbols-outlined text-lg">bolt</span>
                Run Computation
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
                12ms latency
              </span>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-12">
            <div className="border-t border-neutral-800/40 pt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-8 text-neutral-500">
                Analysis Results
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
                {/* Score */}
                <div className="col-span-1 space-y-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-1 text-neutral-500">
                      Global Similarity Score
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-6xl font-black tracking-tighter text-white">
                        84.2
                      </span>
                      <span className="text-2xl font-bold text-neutral-500 mb-1">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-[2px] bg-neutral-800 relative">
                    <div
                      className="absolute h-full bg-blue-400"
                      style={{ width: "84.2%" }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Jaccard", value: "0.76" },
                      { label: "Cosine", value: "0.91" },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-neutral-900 p-4 rounded-sm"
                      >
                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                          {label}
                        </p>
                        <p className="font-mono text-lg text-neutral-200">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* JSON Terminal */}
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
                    <button className="text-neutral-500 hover:text-white">
                      <span className="material-symbols-outlined text-sm">
                        download
                      </span>
                    </button>
                  </div>
                  <div className="p-6 font-mono text-xs leading-relaxed text-blue-200/80 overflow-x-auto">
                    <pre>{`{
  "computation_id": "nlp_lx_4492-xk9",
  "timestamp": "2024-05-20T14:22:11Z",
  "algorithms": [
    { "type": "levenshtein", "distance": 142, "normalized": 0.88 },
    { "type": "jaccard", "coefficient": 0.762 },
    { "type": "ngram", "n": 3, "score": 0.81 }
  ],
  "tokens": {
    "source_count": 214,
    "comparison_count": 208,
    "overlap": 182
  },
  "status": "success"
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
