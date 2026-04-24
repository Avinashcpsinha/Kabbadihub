"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  Search,
  Loader2,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Team, MatchSession } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

function TournamentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  const isSpectator = searchParams.get("view") === "spectator";
  const { tenant } = useTenant();
  const currentTenantId = tenant?.id;
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<MatchSession[]>([]);
  const [view, setView] = useState<"fixtures" | "standings">("fixtures");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newMatch, setNewMatch] = useState({
    homeTeamId: "",
    awayTeamId: "",
    date: "",
    time: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Fetch Teams for the current tenant (to populate the dropdown)
    let teamQuery = supabase.from('teams').select('id, name, short_name, primary_color, city');
    if (currentTenantId && currentTenantId !== 'global') {
      teamQuery = teamQuery.eq('tenant_id', currentTenantId);
    }
    const { data: teamData } = await teamQuery;
    
    if (teamData) {
      setTeams(teamData.map(t => ({
        id: t.id,
        name: t.name,
        shortName: t.short_name,
        primaryColor: t.primary_color,
        city: t.city,
        players: []
      })));
    }

    // 2. Fetch Matches with joined team data
    // We join home and away teams so we don't rely on the 'teams' state for rendering
    let matchQuery = supabase
      .from('live_matches')
      .select(`
        id,
        home_team_id,
        away_team_id,
        scheduled_at,
        status,
        home:home_team_id(id, name, short_name, primary_color, city),
        away:away_team_id(id, name, short_name, primary_color, city)
      `)
      .order('scheduled_at', { ascending: true });
    
    // If organiser, only show their tenant's matches to speed up load
    if (role === 'ORGANISER' && currentTenantId) {
      matchQuery = matchQuery.eq('tenant_id', currentTenantId);
    }

    const { data: matchData, error: matchError } = await matchQuery;
    
    if (matchError) {
      console.error("Error fetching matches:", matchError);
    }

    if (matchData) {
      setMatches(matchData.map(m => {
        const home = m.home as any;
        const away = m.away as any;
        return {
          id: m.id,
          homeTeamId: m.home_team_id,
          awayTeamId: m.away_team_id,
          scheduledAt: new Date(m.scheduled_at),
          status: m.status as any,
          // We'll store the joined data in the object to use it during render
          homeTeam: home ? {
            id: home.id,
            name: home.name,
            shortName: home.short_name,
            primaryColor: home.primary_color,
            city: home.city
          } : null,
          awayTeam: away ? {
            id: away.id,
            name: away.name,
            shortName: away.short_name,
            primaryColor: away.primary_color,
            city: away.city
          } : null
        };
      }));
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentTenantId]);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.homeTeamId || !newMatch.awayTeamId) return;
    if (!currentTenantId) {
      console.error("No tenant context found for match creation");
      return;
    }

    setIsSubmitting(true);
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const { data, error } = await supabase.from('live_matches').insert([{
      id: matchId,
      home_team_id: newMatch.homeTeamId,
      away_team_id: newMatch.awayTeamId,
      scheduled_at: new Date(`${newMatch.date}T${newMatch.time}`).toISOString(),
      status: "UPCOMING",
      tenant_id: currentTenantId,
      state: {
        home: { score: 0, fouls: 0, timeouts: 0, raids: 0, tacklePoints: 0, raidPoints: 0, name: getTeam(newMatch.homeTeamId)?.name, shortName: getTeam(newMatch.homeTeamId)?.shortName },
        away: { score: 0, fouls: 0, timeouts: 0, raids: 0, tacklePoints: 0, raidPoints: 0, name: getTeam(newMatch.awayTeamId)?.name, shortName: getTeam(newMatch.awayTeamId)?.shortName },
        timer: 1200,
        half: 1,
        logs: []
      }
    }]).select();

    if (error) {
      console.error("Match creation failed:", error);
      alert(`Failed to create match: ${error.message}`);
    }

    if (data) {
      await fetchData();
      setIsModalOpen(false);
      setNewMatch({ homeTeamId: "", awayTeamId: "", date: "", time: "" });
    }
    setIsSubmitting(false);
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match fixture? This action cannot be undone.")) return;
    
    const { error } = await supabase.from('live_matches').delete().eq('id', matchId);
    if (error) {
      alert(`Failed to delete match: ${error.message}`);
    } else {
      fetchData();
    }
  };

  const Content = (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans pb-40">
       {(role === "PUBLIC" || isSpectator) && (
          <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-10 z-50">
             <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <button onClick={() => router.back()} className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-orange-600 transition-all border-none cursor-pointer flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5" />
                   </button>
                   <div>
                      <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 leading-none block">Tournament Hub</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Fixtures & Standings</span>
                   </div>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className="hidden md:flex bg-slate-100 p-1.5 rounded-2xl border border-slate-100">
                      <button onClick={() => setView("fixtures")} className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", view === "fixtures" ? "bg-white text-orange-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600")}>Fixtures</button>
                      <button onClick={() => setView("standings")} className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", view === "standings" ? "bg-white text-orange-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600")}>Standings</button>
                   </div>
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
              <div className="flex items-center gap-4">
                 {role && role !== "PUBLIC" && (
                    <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20">
                       <Plus className="w-5 h-5" /> Schedule Match
                    </button>
                 )}
              </div>
           </div>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : view === "fixtures" ? (
             <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                   {matches.map((match: any) => {
                      const home = match.homeTeam;
                      const away = match.awayTeam;
                      
                      return (
                        <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white ch-card overflow-hidden group hover:border-orange-600/30 transition-all duration-500">
                           <div className="flex flex-col md:flex-row items-stretch">
                              <div className="flex-1 p-8 flex items-center justify-end gap-6 text-right">
                                 <div>
                                    <div className="text-xl font-black italic uppercase text-slate-900 group-hover:text-orange-600 transition-colors leading-none mb-1">{home?.name || "TBD"}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{home?.city || "Regional"} Squad</div>
                                 </div>
                                 <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black italic text-white shadow-lg border border-slate-100" style={{ backgroundColor: home?.primaryColor || "#f1f5f9" }}>{home?.shortName || "H"}</div>
                              </div>
                              <div className="px-10 py-6 md:py-0 bg-slate-50 border-x border-slate-50 flex flex-col items-center justify-center text-center min-w-[200px]">
                                 <div className="text-orange-600 font-black italic text-2xl tracking-tighter mb-2">VS</div>
                                 <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-900"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(match.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400"><Clock className="w-3.5 h-3.5 transition-colors group-hover:text-orange-600" /> {new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                 </div>
                              </div>
                              <div className="flex-1 p-8 flex items-center justify-start gap-6 text-left">
                                 <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black italic text-white shadow-lg border border-slate-100" style={{ backgroundColor: away?.primaryColor || "#f1f5f9" }}>{away?.shortName || "A"}</div>
                                 <div>
                                    <div className="text-xl font-black italic uppercase text-slate-900 group-hover:text-orange-600 transition-colors leading-none mb-1">{away?.name || "TBD"}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{away?.city || "Regional"} Squad</div>
                                 </div>
                              </div>
                              <div className="p-8 border-t md:border-t-0 md:border-l border-slate-50 flex flex-col gap-3">
                                 <Link href={role !== "PUBLIC" ? `/scoring?id=${match.id}` : `/overlay?id=${match.id}`} className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-orange-600 hover:text-white transition-all transform hover:scale-105 active:scale-95">
                                    <ChevronRight className="w-6 h-6" />
                                 </Link>
                                 {role && role !== "PUBLIC" && (
                                   <button onClick={() => handleDeleteMatch(match.id)} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-600 transition-all border-none cursor-pointer">
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                 )}
                              </div>
                           </div>
                        </motion.div>
                      );
                   })}
                   {matches.length === 0 && (
                      <div className="py-24 text-center bg-white ch-card border-dashed">
                         <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar className="w-8 h-8" /></div>
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
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black italic text-white shadow-md" style={{ backgroundColor: t.primaryColor }}>{t.shortName}</div>
                                    <div>
                                       <div className="text-sm font-black uppercase italic text-slate-900 group-hover:text-orange-600 transition-colors leading-none mb-1">{t.name}</div>
                                       <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.city}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-center text-sm font-black tabular-nums text-slate-900">0</td>
                              <td className="px-10 py-8 text-center text-sm font-black tabular-nums text-slate-900">0</td>
                              <td className="px-10 py-8 text-right"><span className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black tabular-nums shadow-lg shadow-slate-900/20">0</span></td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}
       </div>

       <AnimatePresence>
          {isModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl relative overflow-hidden">
                   <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                      <div>
                         <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-1">Schedule New Battle</h3>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Organizational Management Suite</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-300"><X className="w-5 h-5" /></button>
                   </div>
                   <form onSubmit={handleCreateMatch} className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Home Franchise</label>
                            <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-black uppercase text-slate-900 focus:ring-2 focus:ring-orange-600/20 transition-all outline-none" value={newMatch.homeTeamId} onChange={(e) => setNewMatch({...newMatch, homeTeamId: e.target.value})}><option value="">Select Team</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Away Franchise</label>
                            <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-black uppercase text-slate-900 focus:ring-2 focus:ring-orange-600/20 transition-all outline-none" value={newMatch.awayTeamId} onChange={(e) => setNewMatch({...newMatch, awayTeamId: e.target.value})}><option value="">Select Team</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Match Date</label>
                            <input required type="date" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-black text-slate-900 outline-none" value={newMatch.date} onChange={(e) => setNewMatch({...newMatch, date: e.target.value})} />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Start Time</label>
                            <input required type="time" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-black text-slate-900 outline-none" value={newMatch.time} onChange={(e) => setNewMatch({...newMatch, time: e.target.value})} />
                         </div>
                      </div>
                      <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/20 mt-8 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Fixture <Target className="w-5 h-5" /></>}
                      </button>
                   </form>
                </motion.div>
             </div>
          )}
       </AnimatePresence>
    </div>
  );

  if (isSpectator || role === "PUBLIC") {
    return <PublicLayout>{Content}</PublicLayout>;
  }

  return (
    <DashboardLayout variant={role === "USER" ? "user" : role === "SUPER_ADMIN" ? "admin" : "organiser"}>
       {Content}
    </DashboardLayout>
  );
}

export default function TournamentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <TournamentContent />
    </Suspense>
  );
}
