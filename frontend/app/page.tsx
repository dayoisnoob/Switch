"use client";

import { ArrowRight, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#7C6EF5]/30 font-sans flex flex-col">
      <nav className="border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Switch Logo"
                width={32}
                height={32}
                priority
              />
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-[13px] font-medium text-white/60 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-[13px] font-semibold bg-[#7C6EF5] text-white px-4 py-2 rounded-lg hover:bg-[#6B5ED4] transition-all shadow-lg shadow-[#7C6EF5]/20 active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 mx-auto shadow-inner">
          <LayoutGrid size={28} className="text-[#7C6EF5]" />
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold text-white/90 tracking-tight mb-6">
          Kanban, without <br className="hidden sm:block" />
          <span className="text-white/40">the clutter.</span>
        </h1>

        <p className="text-[15px] sm:text-[17px] text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          A beautifully minimalist project management tool designed for
          developers who want to focus on writing code, not managing tickets.
          Keep it simple, keep it moving.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-[14px] font-bold rounded-xl text-white bg-[#7C6EF5] hover:bg-[#6B5ED4] transition-all shadow-lg shadow-[#7C6EF5]/20 active:scale-[0.98] group"
          >
            Start building for free
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-[14px] font-bold rounded-xl text-white/70 bg-[#13131A] border border-white/5 hover:bg-white/5 hover:text-white transition-all active:scale-[0.98]"
          >
            Sign in to workspace
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center flex items-center justify-center gap-2 text-[12px] text-white/30 font-medium">
          <span>Designed with simplicity in mind.</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>Switch © 2026</span>
        </div>
      </footer>
    </div>
  );
}
