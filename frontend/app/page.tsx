'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-rose-500 selection:text-white flex items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center">
        <header className="mb-20">
          <h1 className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 mb-6 tracking-tighter drop-shadow-2xl">
            VALORANT SENTINEL
          </h1>
          <p className="text-neutral-400 text-xl font-light tracking-wide max-w-2xl mx-auto">
            The ultimate platform for match orchestration, performance tracking, and AI-driven insights.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Check Profile Card */}
          <Link href="/profile">
            <div className="group relative h-64 bg-neutral-800/50 rounded-3xl border border-white/5 hover:border-rose-500/50 transition-all duration-300 overflow-hidden backdrop-blur-sm hover:transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex flex-col items-center justify-center h-full p-8 relative z-10">
                <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check Profile</h2>
                <p className="text-neutral-400 text-sm">View stats, match history, and performance metrics.</p>
              </div>
            </div>
          </Link>

          {/* AI Analysis Card */}
          <Link href="/analysis">
            <div className="group relative h-64 bg-neutral-800/50 rounded-3xl border border-white/5 hover:border-purple-500/50 transition-all duration-300 overflow-hidden backdrop-blur-sm hover:transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex flex-col items-center justify-center h-full p-8 relative z-10">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">AI Analysis</h2>
                <p className="text-neutral-400 text-sm">Deep dive into a specific match with Gemini AI insights.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
