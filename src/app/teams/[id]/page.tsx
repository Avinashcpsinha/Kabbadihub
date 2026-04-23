"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  ArrowLeft, 
  Search, 
  Zap, 
  Trophy, 
  ChevronRight,
  TrendingUp,
  MapPin,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Team } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function TeamRosterPage() {
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTeamData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch team details
        const { data: teamData } = await supabase
          .from('teams')
          .select('*')
          .eq('id', id)
          .single();
        
        if (teamData) {
          setTeam({
            id: teamData.id,
            name: teamData.name,
            shortName: teamData.short_name,
            primaryColor: teamData.primary_color,
            city: teamData.city,
            players: []
          });

          // 2. Fetch players for this team via join
          const { data: athletes } = await supabase
            .from('athletes')
            .select('*, team_athletes!inner(team_id)')
            .eq('team_athletes.team_id', id);
          
          if (athletes) {
            setPlayers(athletes);
          }
        }
      } catch (err) {
        console.error("Team roster fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchTeamData();
  }, [id]);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="w-12 h-12 text-orange-600 animate-spin" /></div>;
  if (!team) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-500 italic">Franchise not found in cloud registry...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] blur-[150px] rounded-full -z-10 opacity-10" style={{ backgroundColor: team.primaryColor }} />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div className="flex items-start gap-8">
            <Link href="/teams" className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl hover:bg-white/10 transition-all mt-2 border border-white/10">
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </Link>
            <div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-black tracking-widest text-orange-400 uppercase">Pro Registry Roster</div>
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
             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Verified Franchise</div>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
           {[
             { label: "Squad Depth", val: `${players.length} Players`, icon: Users },
             { label: "Elite Pool", val: "Verified", icon: TrendingUp },
             { label: "Registry Sync", val: "Active", icon: Zap },
             { label: "Ecosystem Grade", val: "A+", icon: Trophy }
           ].map((s, i) => (
             <div key={i} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-4">
                <div className="text-slate-500"><s.icon className="w-6 h-6" /></div>
                <div>
                   <div className="text-3xl font-black italic tabular-nums">{s.val}</div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
                </div>
             </div>
           ))}
        </section>

        <div className="space-y-4">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 px-4 gap-6">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Active Franchise Roster</h2>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input 
                  type="text" 
                  placeholder="Filter by name or role..." 
                  className="pl-12 pr-6 py-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 w-full md:w-[320px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>

           <div className="grid gap-3 pb-24">
              <AnimatePresence mode="popLayout">
                {filteredPlayers.length > 0 ? filteredPlayers.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Link href={`/players/${player.id}`}>
                      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/5 flex items-center justify-between group hover:border-orange-500/20 transition-all hover:bg-white/[0.08]">
                        <div className="flex items-center gap-8">
                           <div className="w-14 h-14 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl font-black italic text-orange-500 shadow-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                              {player.number || "??"}
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

                        <div className="hidden md:flex items-center gap-12 text-right">
                           <div className="space-y-1">
                              <div className="text-lg font-black italic tabular-nums text-orange-500">{(player.raid_points || 0) + (player.tackle_points || 0)}</div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Global Score</div>
                           </div>
                           <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )) : (
                  <div className="py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                     <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                     <p className="text-sm font-bold text-slate-500 italic">No players matched your tactical query or roster is empty.</p>
                  </div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
