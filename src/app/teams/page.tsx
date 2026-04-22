"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PublicLayout from "@/components/PublicLayout";
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  MapPin, 
  ChevronRight,
  Shield,
  Zap,
  X,
  Trophy,
  LayoutGrid,
  Rows
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Team } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function CricHeroesStyleTeamsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const { tenant } = useTenant();
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTeam, setNewTeam] = useState({
    name: "",
    shortName: "",
    city: "",
    primaryColor: "#f97316"
  });

  const fallbackTeams: Team[] = [
    {
      id: "1",
      name: "Bengaluru Bulls",
      shortName: "BEN",
      city: "Bengaluru",
      primaryColor: "#f97316",
      secondaryColor: "#b45309",
      players: [],
    },
    {
      id: "2",
      name: "Dabang Delhi",
      shortName: "DEL",
      city: "Delhi",
      primaryColor: "#2563eb",
      secondaryColor: "#1e3a8a",
      players: [],
    }
  ];

  useEffect(() => {
    const activeTenant = tenant || JSON.parse(localStorage.getItem("kabaddihub_current_tenant") || "null") || { id: "global" };
    const tenantId = activeTenant.id;
    const key = `kabaddihub_${tenantId}_teams`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      setTeams(JSON.parse(saved));
    } else if (tenantId === "global") {
      const allTenantsRaw = localStorage.getItem("kabaddihub_tenants");
      if (allTenantsRaw) {
        const tenants: any[] = JSON.parse(allTenantsRaw);
        let aggregated: Team[] = [];
        tenants.forEach(t => {
          const tTeams = localStorage.getItem(`kabaddihub_${t.id}_teams`);
          if (tTeams) aggregated = [...aggregated, ...JSON.parse(tTeams)];
        });
        setTeams(aggregated.length > 0 ? aggregated : fallbackTeams);
      } else {
        setTeams(fallbackTeams);
      }
    } else {
      setTeams(fallbackTeams);
    }
  }, [tenant]);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTenant = tenant || JSON.parse(localStorage.getItem("kabaddihub_current_tenant") || "null");
    if (!activeTenant) return;
    
    const team: Team = {
      id: `team_${Date.now()}`,
      ...newTeam,
      secondaryColor: "#0f172a",
      players: []
    };
    const updated = [...teams, team];
    setTeams(updated);
    localStorage.setItem(`kabaddihub_${activeTenant.id}_teams`, JSON.stringify(updated));
    setIsModalOpen(false);
    setNewTeam({ name: "", shortName: "", city: "", primaryColor: "#f97316" });
  };

  const deleteTeam = (id: string) => {
    if (!confirm("Are you sure you want to remove this squad?")) return;
    const activeTenant = tenant || JSON.parse(localStorage.getItem("kabaddihub_current_tenant") || "null");
    if (!activeTenant) return;
    const updated = teams.filter(t => t.id !== id);
    setTeams(updated);
    localStorage.setItem(`kabaddihub_${activeTenant.id}_teams`, JSON.stringify(updated));
  };

  const getRoleCounts = (teamPlayers: any[]) => {
    let r = 0, d = 0, ar = 0;
    teamPlayers.forEach(p => {
      if (p.role === "RAIDER") r++;
      else if (p.role === "DEFENDER") d++;
      else if (p.role === "ALL_ROUNDER") ar++;
    });
    return { r, d, ar };
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const Content = (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-40">
       {role === "PUBLIC" && (
         <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-10 z-[50]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <button onClick={() => router.back()} className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-orange-600 border-none cursor-pointer">
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                     <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 leading-none block">Franchise Registry</span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Tactical Unit Overview</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="relative hidden md:block">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                      type="text" 
                      placeholder="Search Squads..."
                      className="ch-input !pl-12 w-64 py-3"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
                  {role !== "PUBLIC" && (
                    <button onClick={() => setIsModalOpen(true)} className="ch-btn-primary py-3">
                       <Plus className="w-5 h-5" /> Register
                    </button>
                  )}
               </div>
            </div>
         </nav>
       )}

       <main className="max-w-7xl mx-auto p-6 md:p-12">
          <div className="flex items-center justify-between mb-12">
             <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-3">Unit <span className="text-orange-600">Inventory</span></h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">Listing {teams.length} Tactical Squads Across Global Regions</p>
             </div>
             {role !== "PUBLIC" && (
                <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-3">
                  <Plus className="w-4 h-4" /> Add New Squad
                </button>
             )}
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Squad Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Squad Size</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">R / D / AR Split</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTeams.map((team) => {
                    const stats = getRoleCounts(team.players || []);
                    return (
                      <tr key={team.id} className="group hover:bg-slate-50/30 transition-all">
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black italic text-white shadow-lg shrink-0 transform group-hover:rotate-6 transition-transform"
                              style={{ backgroundColor: team.primaryColor }}
                            >
                              {team.shortName}
                            </div>
                            <div>
                              <div className="text-sm font-black uppercase tracking-tight text-slate-900">{team.name}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {team.city}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-black italic text-slate-900 tabular-nums">{team.players?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                           <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-orange-600 italic leading-none">{stats.r}</span>
                                <span className="text-[8px] font-black text-slate-300 uppercase">Raiders</span>
                              </div>
                              <div className="w-px h-3 bg-slate-200" />
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-blue-600 italic leading-none">{stats.d}</span>
                                <span className="text-[8px] font-black text-slate-300 uppercase">Defenders</span>
                              </div>
                              <div className="w-px h-3 bg-slate-200" />
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-purple-600 italic leading-none">{stats.ar}</span>
                                <span className="text-[8px] font-black text-slate-300 uppercase">All-Round</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-7 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Link href={`/teams/${team.id}`} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-100 hover:shadow-md transition-all">
                                <ChevronRight className="w-4 h-4" />
                             </Link>
                             {role !== "PUBLIC" && (
                               <button 
                                 onClick={() => deleteTeam(team.id)}
                                 className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 transition-all"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
       </main>

       {/* Create Team Modal */}
       <AnimatePresence>
          {isModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl relative overflow-hidden">
                   <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-1">New Unit Enrollment</h3>
                   </div>
                   <form onSubmit={handleCreateTeam} className="p-10 space-y-6">
                      <input className="ch-input py-5 text-sm uppercase font-black" placeholder="SQUAD NAME" value={newTeam.name} onChange={(e) => setNewTeam({...newTeam, name: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                        <input className="ch-input py-5 text-sm uppercase font-black" placeholder="SHORT CODE" maxLength={3} value={newTeam.shortName} onChange={(e) => setNewTeam({...newTeam, shortName: e.target.value})} />
                        <input className="ch-input py-5 text-sm font-black uppercase" placeholder="CITY" value={newTeam.city} onChange={(e) => setNewTeam({...newTeam, city: e.target.value})} />
                      </div>
                      <button type="submit" className="w-full ch-btn-primary py-6 text-sm">Deploy Squad <Shield className="w-5 h-5" /></button>
                   </form>
                </motion.div>
             </div>
          )}
       </AnimatePresence>
    </div>
  );

  if (role === "PUBLIC") return <PublicLayout>{Content}</PublicLayout>;
  return <DashboardLayout variant={role === "USER" ? "user" : "organiser"}>{Content}</DashboardLayout>;
}

function ArrowLeft({ className }: { className?: string }) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
}
