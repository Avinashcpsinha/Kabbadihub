"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PublicLayout from "@/components/PublicLayout";
import { 
  Trophy, 
  Plus, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Zap,
  ArrowLeft,
  Filter,
  X,
  Target,
  Users,
  LayoutGrid,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Team, MatchSession } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function CricHeroesStyleTournamentPage() {
  const router = useRouter();
  const { role } = useAuth();
  const { tenant } = useTenant();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<MatchSession[]>([]);
  const [view, setView] = useState<"fixtures" | "standings">("fixtures");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newMatch, setNewMatch] = useState({
    homeTeamId: "",
    awayTeamId: "",
    date: "",
    time: ""
  });

  useEffect(() => {
    // Determine the active organizational context
    const activeTenant = tenant || JSON.parse(localStorage.getItem("kabaddihub_current_tenant") || "null") || { id: "global" };
    
    // Load teams with multi-layer fallback
    const tenantId = activeTenant.id;
    const teamKey = `kabaddihub_${tenantId}_teams`;
    const savedTeams = localStorage.getItem(teamKey);
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    } else {
      // Load standard teams if localized ones are missing
      const globalTeams = localStorage.getItem('kabaddihub_global_teams');
      if (globalTeams) setTeams(JSON.parse(globalTeams));
    }

    // Load matches with multi-layer fallback
    const matchKey = `kabaddihub_${tenantId}_matches`;
    const savedMatches = localStorage.getItem(matchKey);
    
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    } else if (tenantId === "global") {
      // Aggregate matches from all known tenants for the Global Fixtures view
      const allTenantsRaw = localStorage.getItem("kabaddihub_tenants");
      if (allTenantsRaw) {
        const tenants: any[] = JSON.parse(allTenantsRaw);
        let aggregated: MatchSession[] = [];
        tenants.forEach(t => {
          const tMatches = localStorage.getItem(`kabaddihub_${t.id}_matches`);
          if (tMatches) aggregated = [...aggregated, ...JSON.parse(tMatches)];
        });
        setMatches(aggregated);
      }
    } else {
      // Seed initial data for new tournament hubs
      const initialMatches: MatchSession[] = [
        {
          id: `m_init_${Date.now()}`,
          homeTeamId: "1",
          awayTeamId: "2",
          scheduledAt: new Date(Date.now() + 86400000), 
          status: "UPCOMING"
        }
      ];
      setMatches(initialMatches);
      localStorage.setItem(matchKey, JSON.stringify(initialMatches));
    }
  }, [tenant]);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.homeTeamId || !newMatch.awayTeamId || !tenant) return;

    const match: MatchSession = {
      id: `m${Date.now()}`,
      homeTeamId: newMatch.homeTeamId,
      awayTeamId: newMatch.awayTeamId,
      scheduledAt: new Date(`${newMatch.date}T${newMatch.time}`),
      status: "UPCOMING"
    };

    const updatedMatches = [match, ...matches];
    setMatches(updatedMatches);
    localStorage.setItem(`kabaddihub_${tenant.id}_matches`, JSON.stringify(updatedMatches));
    setIsModalOpen(false);
    setNewMatch({ homeTeamId: "", awayTeamId: "", date: "", time: "" });
  };

  const Content = (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans pb-40">
       {/* Top Navigation - Only show if Public */}
       {role === "PUBLIC" && (
         <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-10 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <button 
                    onClick={() => router.back()} 
                    className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-orange-600 transition-all border-none cursor-pointer flex items-center justify-center"
                  >
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                     <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 leading-none block">Tournament Hub</span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{tenant?.name || "Global"} Fixtures</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="hidden md:flex bg-slate-100 p-1.5 rounded-2xl border border-slate-100">
                     <button 
                       onClick={() => setView("fixtures")}
                       className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", view === "fixtures" ? "bg-white text-orange-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600")}
                     >
                       Fixtures
                     </button>
                     <button 
                       onClick={() => setView("standings")}
                       className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", view === "standings" ? "bg-white text-orange-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600")}
                     >
                       Standings
                     </button>
                  </div>
                  {role !== "PUBLIC" && (
                     <button 
                       onClick={() => setIsModalOpen(true)}
                       className="px-8 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20"
                     >
                        <Plus className="w-5 h-5" /> Schedule
                     </button>
                  )}
               </div>
            </div>
         </nav>
       )}

       <div className="max-w-7xl mx-auto px-8 pt-16">
          <div className="flex items-center justify-between mb-16">
             <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-4">{view === "fixtures" ? "Upcoming Battles" : "Elite Standings"}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">{view === "fixtures" ? "Confirmed match sessions across the arena." : "Live power ranking of organizational franchises."}</p>
             </div>
             <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-orange-600 hover:text-orange-600 transition-all flex items-center gap-3">
                <Filter className="w-4 h-4" /> Date Filter
             </button>
          </div>

          {view === "fixtures" ? (
             <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                   {matches.map((match) => {
                      const home = getTeam(match.homeTeamId);
                      const away = getTeam(match.awayTeamId);
                      
                      return (
                        <motion.div 
                          key={match.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white ch-card overflow-hidden group hover:border-orange-600/30 transition-all duration-500"
                        >
                           <div className="flex flex-col md:flex-row items-stretch">
                              {/* Home Team */}
                              <div className="flex-1 p-8 flex items-center justify-end gap-6 text-right">
                                 <div>
                                    <div className="text-xl font-black italic uppercase text-slate-900 group-hover:text-orange-600 transition-colors leading-none mb-1">{home?.name || "TBD"}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{home?.city || "Regional"} Squad</div>
                                 </div>
                                 <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black italic text-white shadow-lg border border-slate-100" style={{ backgroundColor: home?.primaryColor || "#f1f5f9" }}>
                                    {home?.shortName || "H"}
                                 </div>
                              </div>

                              {/* VS Divider */}
                              <div className="px-10 py-6 md:py-0 bg-slate-50 border-x border-slate-50 flex flex-col items-center justify-center text-center min-w-[200px]">
                                 <div className="text-orange-600 font-black italic text-2xl tracking-tighter mb-2">VS</div>
                                 <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-900">
                                       <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                       {new Date(match.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                       <Clock className="w-3.5 h-3.5 transition-colors group-hover:text-orange-600" />
                                       {new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                 </div>
                              </div>

                              {/* Away Team */}
                              <div className="flex-1 p-8 flex items-center justify-start gap-6 text-left">
                                 <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black italic text-white shadow-lg border border-slate-100" style={{ backgroundColor: away?.primaryColor || "#f1f5f9" }}>
                                    {away?.shortName || "A"}
                                 </div>
                                 <div>
                                    <div className="text-xl font-black italic uppercase text-slate-900 group-hover:text-orange-600 transition-colors leading-none mb-1">{away?.name || "TBD"}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{away?.city || "Regional"} Squad</div>
                                 </div>
                              </div>

                              {/* Action */}
                              <div className="p-8 border-t md:border-t-0 md:border-l border-slate-50">
                                 <Link href={role !== "PUBLIC" ? "/scoring" : `/overlay?id=${match.id}`} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 hover:bg-orange-600 hover:text-white transition-all transform hover:scale-105 active:scale-95">
                                    <ChevronRight className="w-6 h-6" />
                                 </Link>
                              </div>
                           </div>
                        </motion.div>
                      );
                   })}

                   {matches.length === 0 && (
                      <div className="py-24 text-center bg-white ch-card border-dashed">
                         <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-8 h-8" />
                         </div>
                         <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">Arena is Silent</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">No upcoming encounters scheduled for this tournament hub.</p>
                      </div>
                   )}
                </AnimatePresence>
             </div>
          ) : (
             <div className="bg-white ch-card overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                            <th className="px-10 py-6">Pos</th>
                            <th className="px-10 py-6">Franchise Team</th>
                            <th className="px-10 py-6 text-center">Played</th>
                            <th className="px-10 py-6 text-center">Wins</th>
                            <th className="px-10 py-6 text-right">Points</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {teams.map((t, i) => (
                           <tr key={t.id} className="group hover:bg-slate-50/30 transition-all">
                              <td className="px-10 py-8 text-sm font-black italic text-slate-400">#{i + 1}</td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-6">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black italic text-white shadow-md" style={{ backgroundColor: t.primaryColor }}>
                                       {t.shortName}
                                    </div>
                                    <div>
                                       <div className="text-sm font-black uppercase italic text-slate-900 group-hover:text-orange-600 transition-colors leading-none mb-1">{t.name}</div>
                                       <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.city}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-center text-sm font-black tabular-nums text-slate-900">{Math.floor(Math.random() * 10)}</td>
                              <td className="px-10 py-8 text-center text-sm font-black tabular-nums text-slate-900">{Math.floor(Math.random() * 5)}</td>
                              <td className="px-10 py-8 text-right">
                                 <span className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black tabular-nums shadow-lg shadow-slate-900/20">{Math.floor(Math.random() * 20)}</span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}
       </div>

       {/* Create Match Modal */}
       <AnimatePresence>
          {isModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl relative overflow-hidden"
                >
                   <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                      <div>
                         <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-1">Schedule New Battle</h3>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Organizational Management Suite</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-300">
                         <X className="w-5 h-5" />
                      </button>
                   </div>

                   <form onSubmit={handleCreateMatch} className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Home Franchise</label>
                            <select 
                              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-black uppercase text-slate-900 focus:ring-2 focus:ring-orange-600/20 transition-all outline-none"
                              value={newMatch.homeTeamId}
                              onChange={(e) => setNewMatch({...newMatch, homeTeamId: e.target.value})}
                            >
                               <option value="">Select Team</option>
                               {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Away Franchise</label>
                            <select 
                              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-black uppercase text-slate-900 focus:ring-2 focus:ring-orange-600/20 transition-all outline-none"
                              value={newMatch.awayTeamId}
                              onChange={(e) => setNewMatch({...newMatch, awayTeamId: e.target.value})}
                            >
                               <option value="">Select Team</option>
                               {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Match Date</label>
                            <input 
                              type="date" 
                              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-black text-slate-900 outline-none"
                              value={newMatch.date}
                              onChange={(e) => setNewMatch({...newMatch, date: e.target.value})}
                            />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Start Time</label>
                            <input 
                              type="time" 
                              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-black text-slate-900 outline-none"
                              value={newMatch.time}
                              onChange={(e) => setNewMatch({...newMatch, time: e.target.value})}
                            />
                         </div>
                      </div>

                      <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/20 mt-8">
                         Confirm Fixture <Target className="w-5 h-5" />
                      </button>
                   </form>
                </motion.div>
             </div>
          )}
       </AnimatePresence>
    </div>
  );

  if (role === "PUBLIC") return <PublicLayout>{Content}</PublicLayout>;
  return (
    <DashboardLayout variant="organiser">
       {Content}
    </DashboardLayout>
  );
}
