"use client";

import React from "react";
import { 
  Zap, 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  History, 
  Settings2,
  Pause,
  Play,
  UserPlus,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Activity,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMatch } from "@/context/MatchContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ScoringContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { state, activeMatchId, setMatchId, recordEvent, undoLastAction, toggleTimer, resetMatch, setRaider, setDoOrDie, switchHalf } = useMatch();
  const [rosters, setRosters] = React.useState<{ home: any[], away: any[] }>({ home: [], away: [] });

  React.useEffect(() => {
    if (matchId) {
      setMatchId(matchId);
      
      // Load rosters for this match
      let foundMatch: any = null;
      let usedTenantId = "";
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('_matches')) {
          const matches = JSON.parse(localStorage.getItem(key) || "[]");
          const m = matches.find((m: any) => m.id === matchId);
          if (m) {
            foundMatch = m;
            usedTenantId = key.split('_')[1];
            break;
          }
        }
      }

      if (foundMatch && usedTenantId) {
        const teamKey = `kabaddihub_${usedTenantId}_teams`;
        const teams = JSON.parse(localStorage.getItem(teamKey) || "[]");
        const homeT = teams.find((t: any) => t.id === foundMatch.homeTeamId);
        const awayT = teams.find((t: any) => t.id === foundMatch.awayTeamId);
        
        // Finalize rosters with fallback logic
        const finalHome = (homeT?.players && homeT.players.length > 0) 
          ? homeT.players 
          : Array.from({ length: 7 }, (_, i) => ({ id: `h_fallback_${i+1}`, name: `Raider ${i+1}`, number: i+1 }));
          
        const finalAway = (awayT?.players && awayT.players.length > 0) 
          ? awayT.players 
          : Array.from({ length: 7 }, (_, i) => ({ id: `a_fallback_${i+1}`, name: `Raider ${i+1}`, number: i+1 }));

        setRosters({
          home: finalHome,
          away: finalAway
        });
      }
    }
  }, [matchId, setMatchId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-40">
       {/* Scoring Navbar */}
       <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
             <div className="flex items-center gap-6">
                <Link href="/tournaments" className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-orange-600 transition-all">
                   <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                   <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 leading-none block">Match Console</span>
                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Match Instance #{activeMatchId || "102"} • Verified Session</span>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                   Sync Mode: Active
                </div>
                 <button 
                   onClick={undoLastAction}
                   className="p-3 bg-red-50 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 text-[8px] font-black uppercase px-4"
                 >
                    <RotateCcw className="w-4 h-4" /> Undo
                 </button>
                 <button className="p-3 bg-slate-100 rounded-xl text-slate-500">
                    <Settings2 className="w-5 h-5" />
                 </button>
             </div>
          </div>
       </nav>

       <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          
          {/* Main Scoreboard Display */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-2 gap-6 h-full min-h-[350px]">
                   {/* Home Team Score */}
                   <div className="bg-white ch-card relative overflow-hidden flex flex-col items-center justify-center p-10 group border-b-4 border-b-orange-600">
                       <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Official Home</div>
                       <div className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">{state.home.name}</div>
                       <div className="text-8xl md:text-[10rem] font-black tabular-nums tracking-tighter text-slate-900 leading-none">
                          {state.home.score}
                       </div>
                       <div className="mt-8 flex gap-2">
                          {[...Array(7)].map((_, i) => (
                            <div key={i} className={cn("w-2 h-2 rounded-full", i < state.home.matCount ? "bg-emerald-500" : "bg-slate-200")} />
                          ))}
                       </div>
                       <div className="mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">{state.home.matCount} ON MAT</div>
                    </div>

                    {/* Away Team Score */}
                    <div className="bg-white ch-card relative overflow-hidden flex flex-col items-center justify-center p-10 group border-b-4 border-b-blue-600">
                       <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Official Away</div>
                       <div className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">{state.away.name}</div>
                       <div className="text-8xl md:text-[10rem] font-black tabular-nums tracking-tighter text-slate-900 leading-none">
                          {state.away.score}
                       </div>
                       <div className="mt-8 flex gap-2">
                         {[...Array(7)].map((_, i) => (
                            <div key={i} className={cn("w-2 h-2 rounded-full", i < state.away.matCount ? "bg-emerald-500" : "bg-slate-200")} />
                          ))}
                       </div>
                       <div className="mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">{state.away.matCount} ON MAT</div>
                    </div>
                </div>

                {/* Match Timer Component */}
                <div className="bg-white ch-card p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="flex items-center gap-10">
                      <div className="text-center">
                         <div className="text-6xl font-black font-mono leading-none tracking-tighter tabular-nums text-slate-900">
                            {formatTime(state.timer)}
                         </div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 group flex items-center gap-2 cursor-pointer" onClick={switchHalf}>
                             {state.half === 1 ? "1st Half" : "2nd Half"} Action <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                      </div>
                      <div className="h-16 w-px bg-slate-100 hidden md:block" />
                      <div className="flex gap-4">
                         <button 
                           onClick={toggleTimer}
                           className={cn(
                             "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95",
                             state.isActive ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                           )}
                         >
                            {state.isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                         </button>
                         <button 
                           onClick={resetMatch}
                           className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-300 hover:text-slate-600 transition-all flex items-center justify-center active:scale-95"
                         >
                            <RotateCcw className="w-8 h-8" />
                         </button>
                      </div>
                   </div>

                   <div className="flex flex-col items-center md:items-end gap-3 text-center md:text-right w-full md:w-auto">
                      <button 
                        onClick={() => setDoOrDie(!state.isDoOrDie)}
                        className={cn(
                          "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2",
                          state.isDoOrDie ? "bg-red-600 border-red-600 text-white animate-pulse" : "bg-white border-slate-100 text-slate-400"
                        )}
                      >
                         DO-OR-DIE RAID
                      </button>
                      
                      {state.currentRaider ? (
                        <div className="w-full min-w-[280px] mt-4 p-5 bg-orange-600 text-white rounded-[2rem] shadow-2xl shadow-orange-600/30 flex items-center justify-between animate-in slide-in-from-right duration-500 ring-4 ring-orange-100">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                 <User className="w-7 h-7" />
                              </div>
                              <div className="text-left">
                                 <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Now Raiding</div>
                                 <div className="text-xl font-black italic uppercase tracking-tighter leading-none">{state.currentRaider}</div>
                              </div>
                           </div>
                           <div className="relative">
                              <Activity className="w-8 h-8 text-white/30 animate-pulse" />
                              <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" />
                           </div>
                        </div>
                      ) : (
                        <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
                           <span className="opacity-50">Operational Feed:</span>
                           <span className="text-orange-600 font-black italic">{state.lastAction || "AWAITING RAID"}</span>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Scoring Interface Controller */}
             <div className="lg:col-span-4 space-y-8">
                <div className="bg-white ch-card p-10 flex flex-col gap-10">
                   {/* Raider Selection */}
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                         <UserPlus className="w-3 h-3 text-orange-600" />
                         Deploy Active Raider
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-3">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Home Roster</div>
                            <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                               {rosters.home.map((p: any) => (
                                  <button 
                                    key={p.id}
                                    onClick={() => setRaider(`#${p.number} ${p.name}`)}
                                    className={cn(
                                      "text-left p-3 rounded-xl border text-[9px] font-black uppercase transition-all",
                                      state.currentRaider === `#${p.number} ${p.name}` ? "bg-orange-600 border-orange-600 text-white shadow-lg" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-orange-600/30"
                                    )}
                                  >
                                     #{p.number} {p.name.split(' ')[0]}
                                  </button>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-3">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Away Roster</div>
                            <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                               {rosters.away.map((p: any) => (
                                  <button 
                                    key={p.id}
                                    onClick={() => setRaider(`#${p.number} ${p.name}`)}
                                    className={cn(
                                      "text-left p-3 rounded-xl border text-[9px] font-black uppercase transition-all",
                                      state.currentRaider === `#${p.number} ${p.name}` ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-600/30"
                                    )}
                                  >
                                     #{p.number} {p.name.split(' ')[0]}
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>
                      {state.currentRaider && (
                        <button onClick={() => setRaider(null)} className="w-full mt-4 py-2 bg-slate-50 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:text-red-600 transition-colors">Clear Active Raider</button>
                      )}
                   </div>

                   <div className="h-px bg-slate-50" />

                   {/* Scoring Button Matrix */}
                   <div className="space-y-10">
                      {/* Home Actions */}
                      <div className="space-y-4">
                         <div className="text-[9px] font-black text-slate-900 border-l-4 border-orange-600 pl-3 uppercase tracking-widest">{state.home.name}</div>
                         <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3].map(pts => (
                               <button 
                                 key={pts}
                                 onClick={() => recordEvent({ team: "home", points: pts, type: "TOUCH", raider: state.currentRaider || undefined, gameTime: state.timer })}
                                 className="py-3 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                               >
                                  T{pts}
                               </button>
                            ))}
                            <button 
                               onClick={() => recordEvent({ team: "home", points: 1, type: "BONUS", raider: state.currentRaider || undefined, gameTime: state.timer })}
                               className="py-3 bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-500/10 active:scale-95 transition-all"
                             >
                                B
                             </button>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                             <button 
                                onClick={() => recordEvent({ team: "home", points: state.away.matCount <= 3 ? 2 : 1, type: state.away.matCount <= 3 ? "SUPER_TACKLE" : "TACKLE", gameTime: state.timer })} 
                                className="py-3 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                              >
                                {state.away.matCount <= 3 ? "Super Tackle (+2)" : "Tackle"}
                              </button>
                             <button onClick={() => recordEvent({ team: "home", points: 0, type: "TECHNICAL_POINT", gameTime: state.timer })} className="py-3 bg-slate-50 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">Tech Pt</button>
                         </div>
                      </div>

                      {/* Away Actions */}
                      <div className="space-y-4">
                         <div className="text-[9px] font-black text-slate-900 border-l-4 border-blue-600 pl-3 uppercase tracking-widest">{state.away.name}</div>
                         <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3].map(pts => (
                               <button 
                                 key={pts}
                                 onClick={() => recordEvent({ team: "away", points: pts, type: "TOUCH", raider: state.currentRaider || undefined, gameTime: state.timer })}
                                 className="py-3 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                               >
                                  T{pts}
                               </button>
                            ))}
                            <button 
                               onClick={() => recordEvent({ team: "away", points: 1, type: "BONUS", raider: state.currentRaider || undefined, gameTime: state.timer })}
                               className="py-3 bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-500/10 active:scale-95 transition-all"
                             >
                                B
                             </button>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                             <button 
                                onClick={() => recordEvent({ team: "away", points: state.home.matCount <= 3 ? 2 : 1, type: state.home.matCount <= 3 ? "SUPER_TACKLE" : "TACKLE", gameTime: state.timer })} 
                                className="py-3 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                              >
                                {state.home.matCount <= 3 ? "Super Tackle (+2)" : "Tackle"}
                              </button>
                             <button onClick={() => recordEvent({ team: "away", points: 0, type: "TECHNICAL_POINT", gameTime: state.timer })} className="py-3 bg-slate-50 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">Tech Pt</button>
                         </div>
                      </div>
                   </div>
                </div>                 <div className="bg-white ch-card p-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                       <Activity className="w-4 h-4 text-orange-600" /> Live Commentary Feed
                    </h3>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                       {state.history.length > 0 ? state.history.map((h, i) => (
                         <div key={h.id} className="flex gap-4 group relative">
                            <div className="flex flex-col items-center">
                               <div className={cn(
                                 "w-2 h-2 rounded-full z-10",
                                 h.team === "home" ? "bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.4)]" : "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                               )} />
                               <div className="w-px h-full bg-slate-100 absolute top-2 group-last:hidden" />
                            </div>
                            <div className="pb-6">
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[8px] font-black tabular-nums text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{formatTime(h.gameTime)}</span>
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest",
                                    h.type === "TOUCH" ? "bg-orange-100 text-orange-600" :
                                    h.type === "BONUS" ? "bg-amber-100 text-amber-600" :
                                    h.type === "SUPER_TACKLE" ? "bg-emerald-100 text-emerald-600" :
                                    "bg-slate-100 text-slate-600"
                                  )}>{h.type.replace('_', ' ')}</span>
                               </div>
                               <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight italic">
                                  {h.raider ? `${h.raider}: ` : ""}{h.type === "TOUCH" ? `Scores ${h.points} Touch Point${h.points > 1 ? 's' : ''}` :
                                     h.type === "BONUS" ? "Successfully clinches the Bonus!" :
                                     h.type === "SUPER_TACKLE" ? "Defenders stop the raider! SUPER TACKLE triggered (+2)." :
                                     h.type === "TACKLE" ? "Raider tackled out of the mat." :
                                     h.type === "ALL_OUT" ? `ALL-OUT! ${state[h.team].name} wipes the floor.` : 
                                     "Technical point awarded."}
                               </p>
                            </div>
                         </div>
                       )) : (
                         <div className="py-12 text-center text-[10px] font-black text-slate-200 uppercase tracking-widest italic">Awaiting Raid Action...</div>
                       )}
                    </div>
                 </div>
             </div>
          </section>
       </main>
    </div>
  );
}

export default function CricHeroesStyleScoringPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center uppercase font-black italic">Loading Console...</div>}>
      <ScoringContent />
    </Suspense>
  );
}
