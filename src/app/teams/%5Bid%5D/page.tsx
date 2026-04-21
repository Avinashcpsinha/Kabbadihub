"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  ArrowLeft, 
  Plus, 
  Search, 
  Zap, 
  Trophy, 
  Target, 
  Shield, 
  ChevronRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Team, Player } from "@/types";
import { motion } from "framer-motion";

export default function TeamRosterPage() {
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("kabaddihub_teams");
    if (saved) {
      const allTeams: Team[] = JSON.parse(saved);
      const found = allTeams.find(t => t.id === id);
      if (found) setTeam(found);
    }
  }, [id]);

  // Mock players if none exist
  const mockPlayers: Player[] = [
    { id: "p1", name: "PAWAN SEHWAG", role: "RAIDER", number: "01", stats: { matches: 22, raidPoints: 240, tacklePoints: 12, superRaids: 15, superTackles: 0, superTens: 18, highFives: 0 } },
    { id: "p2", name: "SURJEET SINGH", role: "DEFENDER", number: "07", stats: { matches: 20, raidPoints: 0, tacklePoints: 65, superRaids: 0, superTackles: 8, superTens: 0, highFives: 7 } },
    { id: "p3", name: "FAZEL ATRACHALI", role: "DEFENDER", number: "99", stats: { matches: 22, raidPoints: 2, tacklePoints: 72, superRaids: 0, superTackles: 12, superTens: 0, highFives: 9 } },
    { id: "p4", name: "V. AJITH KUMAR", role: "RAIDER", number: "11", stats: { matches: 18, raidPoints: 120, tacklePoints: 5, superRaids: 8, superTackles: 0, superTens: 6, highFives: 0 } },
    { id: "p5", name: "NITIN RAWAL", role: "ALL_ROUNDER", number: "05", stats: { matches: 20, raidPoints: 45, tacklePoints: 35, superRaids: 3, superTackles: 4, superTens: 1, highFives: 2 } },
  ];

  if (!team) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-500 italic">Franchise not found...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Dynamic Brand Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] blur-[150px] rounded-full -z-10 opacity-10" style={{ backgroundColor: team.primaryColor }} />

      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 animate-fade-in">
          <div className="flex items-start gap-8">
            <Link href="/teams" className="p-4 glass rounded-2xl hover:bg-white/5 transition-all mt-2">
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </Link>
            <div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-black tracking-widest text-orange-400 uppercase">Pro Franchise Roster</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                     <MapPin className="w-4 h-4" />
                     {team.city}
                  </div>
               </div>
               <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">{team.name}</h1>
            </div>
          </div>

          <div className="flex flex-col items-end gap-6 h-full">
             <div className="w-32 h-32 rounded-[2rem] flex items-center justify-center text-5xl font-black italic shadow-2xl border-4 border-white/5" style={{ backgroundColor: team.primaryColor }}>
                {team.shortName}
             </div>
             <button className="px-8 py-4 kabaddi-gradient rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-900/20 hover:scale-105 transition-transform">
                Sign New Player
             </button>
          </div>
        </header>

        {/* Squad Performance Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
           {[
             { label: "Squad Depth", val: "12/18", icon: Users },
             { label: "Success Rate", val: "64%", icon: TrendingUp },
             { label: "Elite Raiders", val: "4", icon: Zap },
             { label: "Total Season Pts", val: "482", icon: Trophy }
           ].map((s, i) => (
             <div key={i} className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col gap-4">
                <div className="text-slate-500"><s.icon className="w-6 h-6" /></div>
                <div>
                   <div className="text-3xl font-black italic tabular-nums">{s.val}</div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
                </div>
             </div>
           ))}
        </section>

        {/* Players List */}
        <div className="space-y-4">
           <div className="flex items-center justify-between mb-8 px-4">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">First Seven & Reserves</h2>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input 
                  type="text" 
                  placeholder="Filter by name or role..." 
                  className="pl-12 pr-6 py-3 glass rounded-xl border-white/5 text-xs font-medium focus:outline-none focus:border-orange-500/50 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>

           <div className="grid gap-3">
              {mockPlayers.map((player) => (
                <Link key={player.id} href={`/players/${player.id}`}>
                  <div className="glass p-6 rounded-[1.5rem] border-white/5 flex items-center justify-between group hover:border-orange-500/20 transition-all hover:bg-white/[0.01]">
                    <div className="flex items-center gap-8">
                       <div className="w-14 h-14 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl font-black italic text-orange-500 shadow-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                          {player.number}
                       </div>
                       <div>
                          <h4 className="text-lg font-black italic uppercase italic tracking-tight mb-1 group-hover:text-orange-400 transition-colors">{player.name}</h4>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                            player.role === "RAIDER" ? "bg-red-500/10 text-red-500" : 
                            player.role === "DEFENDER" ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                          )}>
                             {player.role}
                          </span>
                       </div>
                    </div>

                    <div className="hidden md:flex items-center gap-12">
                       <div className="text-center">
                          <div className="text-lg font-black italic tabular-nums">{player.stats.raidPoints + player.stats.tacklePoints}</div>
                          <div className="text-[9px] font-bold text-slate-600 uppercase">Season Pts</div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
