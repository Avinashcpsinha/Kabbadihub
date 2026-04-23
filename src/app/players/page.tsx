"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PublicLayout from "@/components/PublicLayout";
import { 
  Trophy, 
  Zap, 
  Shield, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Filter,
  TrendingUp,
  Award,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Player, Team } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { supabase } from "@/lib/supabase";

export default function LeaderboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSpectator = searchParams.get("view") === "spectator";
  const { role } = useAuth();
  const { tenant } = useTenant();
  const currentTenantId = tenant?.id;
  const [players, setPlayers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"raiders" | "defenders">("raiders");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlayers = async () => {
    setIsLoading(true);
    
    let query = supabase.from('athletes').select('*');
    
    if (currentTenantId && currentTenantId !== 'global') {
      const { data: teams } = await supabase.from('teams').select('id').eq('tenant_id', currentTenantId);
      const teamIds = teams?.map(t => t.id) || [];
      
      if (teamIds.length > 0) {
        const { data: athleteIds } = await supabase.from('team_athletes').select('athlete_id').in('team_id', teamIds);
        const ids = athleteIds?.map(a => a.athlete_id) || [];
        query = query.in('id', ids);
      } else {
        setPlayers([]);
        setIsLoading(false);
        return;
      }
    }

    const { data } = await query;
    if (data) {
      setPlayers(data.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        stats: {
          matches: 0,
          raidPoints: 0,
          tacklePoints: 0,
          superRaids: 0,
          superTackles: 0,
          superTens: 0,
          highFives: 0
        }
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, [currentTenantId]);

  const filteredPlayers = players.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (activeTab === "raiders") return b.stats.raidPoints - a.stats.raidPoints;
    return b.stats.tacklePoints - a.stats.tacklePoints;
  });

  const Content = (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-40">
       {role === "PUBLIC" && (
         <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-10 z-[50]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <button onClick={() => router.back()} className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-orange-600 transition-all border-none cursor-pointer flex items-center justify-center">
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                     <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 leading-none block">Athletic Registry</span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Official Roster & Benchmarks</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                     <button onClick={() => setActiveTab("raiders")} className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "raiders" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400")}>Top Raiders</button>
                     <button onClick={() => setActiveTab("defenders")} className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "defenders" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}>Top Defenders</button>
                  </div>
               </div>
            </div>
         </nav>
       )}

       <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          {isLoading ? (
            <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8 pb-12">
                {sortedPlayers.slice(0, 3).map((p, i) => (
                    <div key={p.id} className={cn("bg-white ch-card p-10 flex flex-col items-center text-center relative overflow-hidden group transition-all hover:scale-[1.02]", i === 0 ? "border-orange-600 ring-4 ring-orange-50 items-center justify-center py-14" : "")}>
                      {i === 0 && <div className="absolute top-0 right-0 p-8 opacity-5"><Trophy className="w-24 h-24" /></div>}
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">{i === 0 ? "Championship King" : i === 1 ? "Premier Force" : "Elite Veteran"}</div>
                      <div className="relative mb-8">
                          <div className={cn("w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-black italic", i === 0 ? "bg-orange-600 text-white w-32 h-32" : "text-slate-400")}>{p.name.charAt(0)}</div>
                          <div className={cn("absolute -bottom-2 right-0 w-10 h-10 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg", i === 0 ? "bg-orange-600" : "bg-slate-900")}><Zap className="w-4 h-4 fill-current" /></div>
                      </div>
                      <div className="space-y-2 mb-8">
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 group-hover:text-orange-600 transition-colors uppercase">{p.name}</h3>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.role}</p>
                      </div>
                    </div>
                ))}
              </div>

              <div className="bg-white ch-card overflow-hidden">
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-600 rounded-xl text-white shadow-lg shadow-orange-600/20"><TrendingUp className="w-5 h-5" /></div>
                      <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900">Career Momentum</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex items-center gap-3">
                          <Search className="w-4 h-4 text-slate-400 ml-2" />
                          <input placeholder="Filter by Name..." className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none w-40" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                      </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                          <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                            <th className="px-10 py-6">Athlete Profile</th>
                            <th className="px-10 py-6 text-center">Matches</th>
                            <th className="px-10 py-6 text-center">Raid Pts</th>
                            <th className="px-10 py-6 text-center">Tackle Pts</th>
                            <th className="px-10 py-6 text-right">League Rank</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {sortedPlayers.map((p, i) => (
                            <tr key={p.id} className="group hover:bg-slate-50/30 transition-all">
                              <td className="px-10 py-8">
                                  <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black italic text-slate-400 relative">
                                        {p.name?.charAt(0)}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-black uppercase italic text-slate-900 group-hover:text-orange-600 transition-colors leading-none">{p.name}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{p.role}</div>
                                    </div>
                                  </div>
                              </td>
                              <td className="px-10 py-8 text-center text-sm font-black tabular-nums text-slate-900">0</td>
                              <td className="px-10 py-8 text-center text-sm font-black tabular-nums text-orange-600">0</td>
                              <td className="px-10 py-8 text-center text-sm font-black tabular-nums text-blue-600">0</td>
                              <td className="px-10 py-8 text-right">
                                  <span className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black tabular-nums shadow-lg shadow-slate-900/10"># {i + 1}</span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                </div>

                {sortedPlayers.length === 0 && (
                    <div className="py-24 text-center">
                      <Users className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                      <h3 className="text-xl font-black italic uppercase text-slate-900 mb-2">No Athletes Found</h3>
                      <p className="text-sm text-slate-400">Unable to find an athlete matching "{searchQuery}"</p>
                    </div>
                  )}
              </div>
            </>
          )}
       </main>
    </div>
  );

  // Conditionally render layout
  if (isSpectator || role === "PUBLIC") {
    return <PublicLayout>{Content}</PublicLayout>;
  }

  // Default to DashboardLayout for logged-in users navigating through Admin/User consoles
  return (
    <DashboardLayout variant="organiser">
       {Content}
    </DashboardLayout>
  );
}
