"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const getLinkStyle = (path: string) => {
    const baseStyle = "font-mono text-xs uppercase tracking-widest";
    const activeStyle = "text-white font-medium border-b border-white pb-1";
    const inactiveStyle =
      "text-neutral-500 hover:text-neutral-200 transition-colors";

    return `${baseStyle} ${pathname === path ? activeStyle : inactiveStyle}`;
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-xl">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <div className="text-lg font-bold tracking-tighter text-white font-mono">
          ARCHITECT.IO
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <Link className={getLinkStyle("/")} href="/">
            Docs
          </Link>

          <Link
            className={getLinkStyle("/lexicalmatcher")}
            href="/lexicalmatcher"
          >
            Lexical Matcher
          </Link>

          <Link className={getLinkStyle("/dendrograma")} href="/dendrograma">
            Dendrograma
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-white hover:bg-white/5 transition-all duration-200">
            <span className="material-symbols-outlined">terminal</span>
          </button>
          <button className="bg-white text-black px-6 py-2 font-mono font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.99] transition-all">
            Deploy
          </button>
        </div>
      </nav>
    </header>
  );
}
