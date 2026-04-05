export function Footer() {
  return (
    <footer className="w-full border-t border-neutral-900 bg-black">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto">
        <div className="mb-8 md:mb-0">
          <div className="text-neutral-200 font-bold tracking-tighter text-xl mb-2">
            ARCHITECT.IO
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            © 2024 ARCHITECT.IO — PRECISION BRUTALISM
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {["Status: Operational", "Changelog", "Security", "Terms"].map(
            (link) => (
              <a
                key={link}
                className="font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
                href="#"
              >
                {link}
              </a>
            ),
          )}
        </div>
        <div className="mt-8 md:mt-0 flex gap-4">
          {["code", "terminal"].map((icon) => (
            <button
              key={icon}
              className="w-10 h-10 border border-neutral-800 flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-neutral-400 text-sm">
                {icon}
              </span>
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
