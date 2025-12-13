'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

export default function Analysis() {
  const searchParams = useSearchParams();
  const [matchId, setMatchId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [contextData, setContextData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const mId = searchParams.get('match_id');
    const pName = searchParams.get('player_name');
    if (mId) setMatchId(mId);
    if (pName) setPlayerName(pName);
  }, [searchParams]);

  const analyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInsight(null);
    setContextData(null);

    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: matchId.trim(), player_name: playerName.trim() }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch analysis');

      setInsight(result.text || "No analysis text returned.");
      setContextData(result.context || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-indigo-600/10 blur-[100px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-violet-600/10 blur-[100px] rounded-full mix-blend-screen animate-pulse-slow delay-700"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 w-full max-w-[95%]">
        <header className="text-center mb-12 space-y-4">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors py-2 px-4 rounded-full hover:bg-white/5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Home
          </a>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50">
            Match Analysis
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
            Get professional coaching insights powered by AI tailored to your gameplay.
          </p>
        </header>

        {/* Input Form */}
        <div className="flex justify-center mb-16">
          <form onSubmit={analyze} className="relative w-full max-w-2xl group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-[#0F0F0F] rounded-2xl ring-1 ring-white/10 shadow-2xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 overflow-hidden">
              <input
                type="text"
                placeholder="Player Name (e.g. WorstJett)"
                className="bg-transparent text-white px-6 py-5 w-full md:w-[35%] focus:outline-none focus:bg-white/5 placeholder-neutral-600 text-lg transition-colors"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Match ID (e.g., a4e99f5e-...)"
                className="bg-transparent text-white px-6 py-5 w-full md:w-[50%] focus:outline-none focus:bg-white/5 placeholder-neutral-600 text-lg transition-colors"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="md:w-[15%] bg-white/5 hover:bg-white/10 text-indigo-400 font-medium transition-all disabled:opacity-50 flex items-center justify-center py-4 md:py-0 hover:text-white"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-12 text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        <AnimatePresence>
          {insight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Main Analysis Column */}
              <div className="lg:col-span-7 space-y-8">
                <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden min-h-[80vh]">
                  <div className="prose prose-invert prose-lg max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                    prose-h1:text-4xl prose-h1:mb-8 prose-h1:bg-clip-text prose-h1:text-transparent prose-h1:bg-gradient-to-r prose-h1:from-indigo-400 prose-h1:to-purple-400
                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-indigo-200 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-4
                    prose-h3:text-xl prose-h3:text-white/90 prose-h3:mt-8
                    prose-strong:text-indigo-400 prose-strong:font-semibold
                    prose-ul:space-y-2 prose-li:text-neutral-300
                    prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-500/10 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-white
                    prose-table:w-full prose-table:text-sm prose-th:text-neutral-400 prose-active:text-white prose-td:text-neutral-300">
                    <ReactMarkdown>{insight}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Chat Column */}
              <div className="lg:col-span-5">
                <div className="sticky top-8">
                  <ChatInterface context={contextData} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ChatInterface({ context }: { context: any }) {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMsg.content,
          context: context,
          history: messages
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "Connection error." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to reach the coach." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-white/5 rounded-3xl flex flex-col h-[80vh] lg:h-[calc(100vh-10rem)] shadow-2xl relative overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Coach Assistant
        </h2>
        <p className="text-xs text-neutral-500 mt-1">Ask about the match stats</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-2xl">⚡</div>
            <p className="text-sm font-medium">Ready to analyze.</p>
            <p className="text-xs mt-2">Try asking: "Why was my eco bad?" or "How do I improve avg combat score?"</p>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${m.role === 'user'
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-white/5 text-neutral-200 rounded-bl-sm border border-white/5'
              }`}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/5 rounded-2xl px-4 py-3 flex gap-1.5 items-center rounded-bl-none">
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <form onSubmit={sendMessage} className="relative">
          <input
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-5 pr-12 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-neutral-600"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-neutral-800"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
