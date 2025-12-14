'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [tag, setTag] = useState('');
  const [region, setRegion] = useState('ap');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [insightData, setInsightData] = useState<Record<string, any>>({});
  const [insightLoading, setInsightLoading] = useState<Record<string, boolean>>({});

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, tag, region }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch dashboard');
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMatch = async (matchId: string) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
      return;
    }

    setExpandedMatch(matchId);

    if (!insightData[matchId] && !insightLoading[matchId]) {
      setInsightLoading(prev => ({ ...prev, [matchId]: true }));
      try {
        const res = await fetch('/api/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ match_id: matchId, username, tag }),
        });
        const result = await res.json();
        setInsightData(prev => ({ ...prev, [matchId]: result }));
      } catch (err) {
        console.error(err);
      } finally {
        setInsightLoading(prev => ({ ...prev, [matchId]: false }));
      }
    }
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-rose-500 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-8">
          <a href="/" className="text-sm text-neutral-500 hover:text-white transition-colors mb-4 inline-block">&larr; Back to Home</a>
          <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 mb-4 tracking-tighter drop-shadow-lg">
            PLAYER PROFILE
          </h1>
          <p className="text-neutral-400 text-lg font-light tracking-wide">
            Analyze execution and performance
          </p>
        </header>

        {/* Search Input */}
        <div className="flex justify-center mb-16">
          <form onSubmit={search} className="relative w-full max-w-lg group">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex bg-neutral-900 rounded-2xl ring-1 ring-white/10 shadow-2xl overflow-hidden">
              <div className="relative w-1/5 border-r border-white/5">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full h-full bg-transparent text-white px-2 py-4 text-center appearance-none focus:outline-none font-bold uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <option value="ap" className="bg-neutral-900">AP</option>
                  <option value="na" className="bg-neutral-900">NA</option>
                  <option value="eu" className="bg-neutral-900">EU</option>
                  <option value="kr" className="bg-neutral-900">KR</option>
                  <option value="latam" className="bg-neutral-900">LATAM</option>
                  <option value="br" className="bg-neutral-900">BR</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Username"
                className="bg-transparent text-white px-6 py-4 w-2/5 focus:outline-none placeholder-neutral-600 text-lg border-r border-white/5"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tag"
                className="bg-transparent text-white px-6 py-4 w-1/4 focus:outline-none placeholder-neutral-600 text-lg"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-1/4 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center backdrop-blur-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-8 backdrop-blur-md text-center animate-in fade-in slide-in-from-top-4">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Player Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{data.name}<span className="text-neutral-500 text-2xl font-light">#{data.tag}</span></h2>
                <div className="flex gap-4 text-sm font-medium tracking-wider">
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/20">LEVEL {data.level}</span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">{data.rank.toUpperCase()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-neutral-500 text-sm mb-1 uppercase tracking-widest">Current Rank</div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">{data.rank}</div>
              </div>
            </div>

            {/* Matches List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-neutral-300 mb-6 px-2">Last 10 Matches</h3>
              {data.matches.map((match: any, idx: number) => (
                <div key={idx} className="group">
                  <div
                    onClick={() => toggleMatch(match.match_id)}
                    className="cursor-pointer bg-neutral-800/50 hover:bg-neutral-800 border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all duration-300 flex items-center gap-6 relative overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${match.result === 'Victory' ? 'bg-emerald-500' : match.result === 'Defeat' ? 'bg-rose-500' : 'bg-neutral-500'}`}></div>

                    {/* Agent Image */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-700 ring-2 ring-white/10">
                      {match.agent_image ? <img src={match.agent_image} alt="Agent" className="w-full h-full object-cover transform scale-110" /> : <div className="w-full h-full bg-neutral-800"></div>}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-lg text-white">{match.map}</span>
                        <span className={`text-sm font-bold uppercase tracking-wider ${match.result === 'Victory' ? 'text-emerald-400' : match.result === 'Defeat' ? 'text-rose-400' : 'text-neutral-400'}`}>
                          {match.result}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span>KDA: <span className="text-white font-mono">{match.kda}</span></span>
                        <span className="text-neutral-500">|</span>
                        <span>Score: <span className="text-white font-mono">{match.score}</span></span>
                        <span className="text-xs text-neutral-600">{match.match_id}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/analysis?match_id=${match.match_id}&player_name=${username}`, '_blank');
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5 z-20 relative"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        AI Assist
                      </button>
                      <div className={`transform transition-transform duration-300 ${expandedMatch === match.match_id ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Insight Accordion */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedMatch === match.match_id ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-black/30 rounded-2xl border border-white/5 p-6 backdrop-blur-md mx-2">
                      {insightLoading[match.match_id] ? (
                        <div className="flex justify-center p-4">
                          <div className="text-rose-500 text-sm font-medium animate-pulse">Getting Match Stats...</div>
                        </div>
                      ) : insightData[match.match_id]?.error ? (
                        <div className="text-red-400 text-center text-sm">{insightData[match.match_id].error}</div>
                      ) : insightData[match.match_id] ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Headshot %</div>
                            <div className="text-2xl font-bold text-white">{insightData[match.match_id].headshot_percent}%</div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="text-neutral-500 text-xs uppercase tracking-widest mb-1">ACS</div>
                            <div className="text-2xl font-bold text-emerald-400">{insightData[match.match_id].acs}</div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="text-neutral-500 text-xs uppercase tracking-widest mb-1">K/D Ratio</div>
                            <div className="text-2xl font-bold text-blue-400">{insightData[match.match_id].kdr}</div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="text-neutral-500 text-xs uppercase tracking-widest mb-1">ADR</div>
                            <div className="text-2xl font-bold text-white">{insightData[match.match_id].adr}</div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="text-neutral-500 text-xs uppercase tracking-widest mb-1">First Bloods</div>
                            <div className="text-2xl font-bold text-rose-400">{insightData[match.match_id].first_bloods}</div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
