export default function Home() {
  return (
    <>
      <main
        className="pt-16"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      >
        {/* Hero */}
        <section className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden border-b border-white/5 bg-neutral-950">
          {/* Background watermark */}
          <div className="absolute inset-0 z-0 opacity-10 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[25vw] font-black tracking-tighter text-white leading-none">
              NLP_CORE
            </span>
          </div>

          <div className="max-w-7xl mx-auto w-full z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-8">
              <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.85] text-white mb-8">
                BEYOND<br />LANGUAGE
              </h1>
              <div className="flex flex-col md:flex-row md:items-end gap-8">
                <p className="max-w-md font-mono text-neutral-400 leading-relaxed uppercase text-sm tracking-wide">
                  The high-performance neural engine for surgical text analysis. Built for engineers who demand millisecond-latency and absolute lexical precision.
                </p>
                <div className="flex gap-4">
                  <button className="bg-cyan-300 text-black px-8 py-4 font-bold uppercase tracking-tighter text-lg active:scale-95 transition-transform">
                    Initialize Engine
                  </button>
                </div>
              </div>
            </div>

            {/* System Log Card */}
            <div className="md:col-span-4 self-start mt-12 md:mt-0">
              <div
                className="bg-neutral-900 border border-white/10 p-4 font-mono text-[10px] text-cyan-300"
                style={{ boxShadow: "0 0 20px rgba(0,251,251,0.1)" }}
              >
                <div className="flex justify-between border-b border-white/10 pb-2 mb-4">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-300 inline-block" />
                    SYSTEM_LOG: ACTIVE
                  </span>
                  <span>v4.0.12-ALPHA</span>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40"># Calculating Jaccard Similarity</p>
                  <p className="text-white">SET_A: [&quot;neural&quot;, &quot;engine&quot;, &quot;precision&quot;]</p>
                  <p className="text-white">SET_B: [&quot;neural&quot;, &quot;engine&quot;, &quot;latency&quot;]</p>
                  <p className="text-neutral-500">{'INTERSECT: {"neural", "engine"}'}</p>
                  <p className="text-neutral-500">{'UNION: {"neural", "engine", "precision", "latency"}'}</p>
                  <p className="text-cyan-300 mt-2">RESULT: 0.500000000000</p>
                  <div className="w-full bg-white/5 h-1 mt-4 overflow-hidden">
                    <div className="bg-cyan-300 h-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Asymmetric Value Prop / Terminal Demo */}
        <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-12 gap-16 border-b border-white/5 bg-neutral-950">
          <div className="md:col-span-5 flex flex-col justify-center">
            <div className="font-mono text-cyan-300 text-xs uppercase tracking-[0.4em] mb-6">
              Execution / Layer 01
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-8">
              STRUCTURAL<br />INTELLIGENCE.
            </h2>
            <p className="text-neutral-400 font-mono text-lg leading-relaxed mb-8">
              Stop treating text as strings. ARCHITECT.IO processes linguistic data as multi-dimensional tensors, enabling raw mathematical operations on semantic meaning.
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <div className="text-2xl font-bold text-white tracking-tighter">0.03ms</div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Inference Latency</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white tracking-tighter">99.9%</div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Lexical Accuracy</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="bg-black border border-white/10 relative overflow-hidden h-[450px]">
              {/* Terminal bar */}
              <div className="absolute top-0 left-0 w-full bg-neutral-800 px-4 py-1.5 flex justify-between items-center z-20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-neutral-600" />
                  <div className="w-2.5 h-2.5 bg-neutral-600" />
                  <div className="w-2.5 h-2.5 bg-neutral-600" />
                </div>
                <div className="text-[10px] font-mono text-neutral-500">
                  terminal — nlp_engine_live
                </div>
              </div>

              <div className="p-8 pt-12 font-mono text-sm leading-relaxed overflow-hidden">
                <div className="flex gap-4 mb-4">
                  <span className="text-cyan-300">λ</span>
                  <span className="text-white">
                    architect analyze --source=&quot;cluster_09&quot; --mode=&quot;aggressive&quot;
                  </span>
                </div>
                <div className="text-neutral-500 mb-2">[INFO] Handshaking with secure_vault_proxy... SUCCESS</div>
                <div className="text-neutral-500 mb-2">[INFO] Ingesting 4.2GB dataset... DONE</div>
                <div className="text-neutral-500 mb-6">[INFO] Initializing tokenizer pipeline... [0ms]</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border-l-2 border-cyan-300">
                    <div className="text-[10px] text-neutral-500 mb-1">COSINE_SIMILARITY</div>
                    <div className="text-cyan-300 font-bold text-lg">0.98214</div>
                  </div>
                  <div className="p-4 bg-white/5 border-l-2 border-cyan-300">
                    <div className="text-[10px] text-neutral-500 mb-1">LEVENSHTEIN</div>
                    <div className="text-cyan-300 font-bold text-lg">12_DIST</div>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-2">
                  <span className="text-cyan-300">_</span>
                  <span className="w-2 h-5 bg-cyan-300/50" />
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-cyan-300/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Manifesto / Scrolling Timeline */}
        <section className="max-w-7xl mx-auto px-6 py-32 bg-neutral-950">
          <div className="mb-24">
            <div className="font-mono text-cyan-300 text-xs uppercase tracking-[0.4em] mb-6">
              Manifesto / CORE_VALUES
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-white">THE ENGINE RULES.</h2>
          </div>

          <div className="space-y-0 relative border-l border-white/10">
            {[
              {
                n: "01",
                title: "Raw Speed Over Soft UX",
                body: "We optimize for throughput, not beauty. ARCHITECT.IO utilizes SIMD instructions and custom CUDA kernels to process tokens at the speed of silicon.",
              },
              {
                n: "02",
                title: "Deterministic Precision",
                body: "Zero hallucination. Our engine is grounded in strict lexical logic, ensuring that every output is a direct derivation of the input vectors.",
              },
              {
                n: "03",
                title: "Deep CLI Integration",
                body: "Built for your terminal, not your browser. A first-class command-line interface ensures your workflows remain efficient and scriptable.",
              },
            ].map(({ n, title, body }, i) => (
              <div key={n} className={`relative pl-12 group ${i < 2 ? "pb-32" : ""}`}>
                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-cyan-300" />
                <div className="flex flex-col md:flex-row md:items-start gap-12">
                  <div className="md:w-1/4">
                    <span className="text-8xl font-black text-white/5 leading-none">{n}</span>
                  </div>
                  <div className="md:w-3/4">
                    <h3 className="text-3xl font-bold text-white mb-6 tracking-tight uppercase">{title}</h3>
                    <p className="font-mono text-neutral-400 text-xl leading-relaxed max-w-2xl">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-cyan-300 px-6 py-24 text-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              START<br />BUILDING.
            </h2>
            <div className="flex flex-col gap-6 max-w-md">
              <p className="font-mono font-bold uppercase tracking-tight text-lg">
                Initialize your first cluster in under 120 seconds. No credit card required during alpha phase.
              </p>
              <div className="flex gap-4">
                <button className="bg-black text-white px-8 py-4 font-bold uppercase text-sm active:scale-95 transition-transform">
                  Get API Key
                </button>
                <button className="border-2 border-black px-8 py-4 font-bold uppercase text-sm hover:bg-black/10 transition-colors">
                  Documentation
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}