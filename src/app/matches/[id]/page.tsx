"use client";

import React from "react";
import { 
  Trophy, 
  ChevronRight, 
  ArrowLeft, 
  Download, 
  Share2,
  Zap,
  Shield,
  Clock,
  LayoutGrid,
  Users,
  Target,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MatchReportPage() {
  const match = {
    id: "m102",
    home: { name: "Bengaluru Panthers", score: 42, color: "#f97316" },
    away: { name: "Dabang Warriors", score: 38, color: "#2563eb" },
    status: "COMPLETED",
    duration: "40:00",
    date: "Apt 09, 2026",
    winner: "Bengaluru Panthers",
    mvp: {
      name: "PAWAN SEHWAG",
      team: "Panthers",
      points: 18,
      type: "RAIDER"
    },
    stats: [
      { label: "Successful Raids", home: 24, away: 20 },
      { label: "Tackle Points", home: 12, away: 14 },
      { label: "All-Outs Inflicted", home: 2, away: 1 },
      { label: "Extra Points", home: 4, away: 3 }
    ]
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-5xl mx-auto">
        {/* Header Navigation */}
        <header className="flex items-center justify-between mb-12">
          <Link href="/tournaments" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Hub</span>
          </Link>
          <div className="flex gap-4">
            <button className="p-3 glass rounded-xl text-slate-400 hover:text-white transition-all"><Share2 className="w-5 h-5" /></button>
            <button className="p-3 glass rounded-xl text-slate-400 hover:text-white transition-all"><Download className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Hero Score Display */}
        <section className="mb-12">
          <div className="glass rounded-[3rem] p-12 border-white/5 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-blue-600" />
            
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Match Completed</span>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-24 h-24 rounded-[2rem] bg-orange-500 shadow-2xl shadow-orange-900/40 flex items-center justify-center text-4xl font-black italic mb-6">PAN</div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2">{match.home.name}</h2>
                <div className="text-8xl font-black tabular-nums tracking-tighter">{match.home.score}</div>
              </div>

              <div className="flex flex-col items-center">
                 <div className="text-slate-700 font-black text-4xl italic mb-4">FINAL</div>
                 <div className="w-16 h-px bg-white/10" />
              </div>

              <div className="flex-1 flex flex-col items-center text-blue-600">
                <div className="w-24 h-24 rounded-[2rem] bg-blue-600 shadow-2xl shadow-blue-900/40 flex items-center justify-center text-4xl font-black italic mb-6 text-white">WAR</div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2 text-white">{match.away.name}</h2>
                <div className="text-8xl font-black tabular-nums tracking-tighter text-white">{match.away.score}</div>
              </div>
            </div>

            <div className="mt-16 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-6">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {match.duration} FULL TIME</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> {match.date}</span>
            </div>
          </div>
        </section>

        {/* Player of the Match */}
        <section className="mb-12">
           <div className="grid md:grid-cols-12 gap-6">
              <div className="md:col-span-5 glass rounded-[2.5rem] bg-orange-500/5 border-orange-500/20 p-8 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 blur-[40px] rounded-full" />
                <Trophy className="w-10 h-10 text-orange-400 mb-6 drop-shadow-lg" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/60 mb-2">Player of the Match</div>
                <div className="w-32 h-32 rounded-full border-4 border-orange-500/20 mb-6 flex items-center justify-center text-4xl font-black bg-slate-900 shadow-2xl">
                  {match.mvp.name.charAt(0)}
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-1">{match.mvp.name}</h3>
                <p className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-6">PANTHERS RAIDER</p>
                <div className="grid grid-cols-2 gap-4 w-full">
                   <div className="glass p-4 rounded-2xl border-white/5">
                      <div className="text-2xl font-black italic">{match.mvp.points}</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Raid Pts</div>
                   </div>
                   <div className="glass p-4 rounded-2xl border-white/5">
                      <div className="text-2xl font-black italic">84%</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase">SR</div>
                   </div>
                </div>
              </div>

              <div className="md:col-span-7 glass rounded-[2.5rem] p-8 border-white/5 flex flex-col">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-3">
                  <Activity className="w-4 h-4 text-orange-500" />
                  Team Comparison
                </h3>
                <div className="space-y-8 flex-1 flex flex-col justify-center">
                  {match.stats.map((s, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end px-1">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-orange-500" />
                           {s.home}
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest leading-none">{s.label}</span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                           {s.away}
                           <span className="w-2 h-2 rounded-full bg-blue-600" />
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                        <div 
                          className="h-full bg-orange-500" 
                          style={{ width: `${(s.home / (s.home + s.away)) * 100}%` }} 
                        />
                        <div 
                          className="h-full bg-blue-600" 
                          style={{ width: `${(s.away / (s.home + s.away)) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </section>

        {/* Key Match Moments */}
        <section>
          <div className="glass rounded-[2rem] p-10 border-white/5 overflow-hidden">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-10 flex items-center gap-3">
               <Target className="w-4 h-4 text-orange-500" />
               Key Match Moments
             </h3>
             <div className="space-y-10 relative">
               <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/5" />
               {[
                 { time: "38:45", event: "ALL-OUT INFLICTED", desc: "Panthers take a 4-point lead in the final minutes.", team: "home" },
                 { time: "24:12", event: "SUPER RAID", desc: "P. Sehwag earns 3 crucial points for the Panthers.", team: "home" },
                 { time: "18:05", event: "SUPER TACKLE", desc: "Warriors defense stops the raider with only 3 on mat.", team: "away" },
               ].map((m, i) => (
                 <div key={i} className="flex gap-8 relative">
                   <div className={cn(
                     "w-[23px] h-[23px] rounded-full border-4 border-[#020617] relative z-10",
                     m.team === "home" ? "bg-orange-500" : "bg-blue-600"
                   )} />
                   <div>
                     <div className="flex items-center gap-4 mb-2">
                        <span className="text-xs font-black font-mono text-slate-500 tracking-tighter">{m.time}</span>
                        <span className="px-3 py-1 rounded bg-white/5 text-[10px] font-black uppercase tracking-widest italic border border-white/5">{m.event}</span>
                     </div>
                     <p className="text-sm text-slate-400 max-w-lg">{m.desc}</p>
                   </div>
                 </div>
               ))}
               <div className="flex items-center gap-2 pl-12 text-xs font-bold text-slate-600 hover:text-orange-400 transition-colors cursor-pointer group">
                  View Full Timeline <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
