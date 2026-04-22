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
  ArrowLeft,
  X,
  Palette,
  LayoutGrid,
  Trophy
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
      // Aggregate from all tenants for Global view
      const allTenantsRaw = localStorage.getItem("kabaddihub_tenants");
      if (allTenantsRaw) {
        const tenants: any[] = JSON.parse(allTenantsRaw);
        let aggregated: Team[] = [];
        tenants.forEach(t => {
          const tTeams = localStorage.getItem(`kabaddihub_${t.id}_teams`);
          if (tTeams) aggregated = [...aggregated, ...JSON.parse(tTeams)];
        });
        // If still empty, use fallback
        setTeams(aggregated.length > 0 ? aggregated : fallbackTeams);
      } else {
        setTeams(fallbackTeams);
      }
    } else {
      setTeams(fallbackTeams);
      localStorage.setItem(key, JSON.stringify(fallbackTeams));
    }
  }, [tenant]);

  const saveTeams = (updatedTeams: Team[]) => {
    const activeTenant = tenant || JSON.parse(localStorage.getItem("kabaddihub_current_tenant") || "null");
    if (!activeTenant) return;
    setTeams(updatedTeams);
    localStorage.setItem(`kabaddihub_${activeTenant.id}_teams`, JSON.stringify(updatedTeams));
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !newTeam.shortName || !newTeam.city) return;

    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name.toUpperCase(),
      shortName: newTeam.shortName.toUpperCase(),
      city: newTeam.city,
      primaryColor: newTeam.primaryColor,
      secondaryColor: "#1e293b",
      players: []
    };

    const updatedTeams = [...teams, team];
    saveTeams(updatedTeams);
    setIsModalOpen(false);
    setNewTeam({ name: "", shortName: "", city: "", primaryColor: "#f97316" });
  };

  const deleteTeam = (id: string) => {
    if (confirm("Are you sure you want to remove this franchise?")) {
      const updatedTeams = teams.filter(t => t.id !== id);
      saveTeams(updatedTeams);
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const Content = (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans pb-40">
       {/* Top Navigation - Only show if Public */}
       {role === "PUBLIC" && (
         <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-10 z-[50]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <button 
                    onClick={() => router.back()} 
                    className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-orange-600 transition-all border-none cursor-pointer flex items-center justify-center"
                  >
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                     <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 leading-none block">Squad Registry</span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{tenant?.name || "Global"} Management</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="relative hidden md:block">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                      type="text" 
                      placeholder="Search Franchise..."
                      className="ch-input !pl-12 w-64 py-3"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
                  {role !== "PUBLIC" && (
                    <button 
                     onClick={() => setIsModalOpen(true)}
                     className="ch-btn-primary py-3"
                    >
                       <Plus className="w-5 h-5" /> Register
                    </button>
                  )}
               </div>
            </div>
         </nav>
       )}

       <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-4">Franchise <span className="text-orange-600">Directory</span></h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">Managing {teams.length} World-Class Kabaddi Units</p>
             </div>
             <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-orange-600 hover:border-orange-600/30 transition-all">
                <LayoutGrid className="w-5 h-5" />
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <AnimatePresence mode="popLayout">
                {filteredTeams.map((team) => (
                  <motion.div 
                    layout
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white ch-card relative overflow-hidden group hover:border-orange-600/30 transition-all duration-500"
                  >
                     <div className="h-24 w-full relative overflow-hidden opacity-10 group-hover:opacity-20 transition-opacity">
                        <div className="absolute inset-0 pattern-dots group-hover:scale-110 transition-transform duration-700" style={{ color: team.primaryColor }} />
                     </div>
                     
                     <div className="p-10 -mt-16 text-center relative z-10">
                        <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-3xl font-black italic text-white shadow-2xl border-4 border-white transform group-hover:rotate-6 transition-all duration-500" style={{ backgroundColor: team.primaryColor }}>
                           {team.shortName}
                        </div>
                        
                        <div className="space-y-1 mb-8">
                           <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">{team.name}</h3>
                           <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <MapPin className="w-3 h-3" /> {team.city}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="p-4 bg-slate-50 rounded-2xl">
                              <div className="text-sm font-black italic text-slate-900 tabular-nums">{team.players?.length || 0}</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Squad Size</div>
                           </div>
                           <div className="p-4 bg-slate-50 rounded-2xl">
                              <div className="text-sm font-black italic text-slate-900 tabular-nums">{Math.floor(Math.random() * 5)}</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Titles</div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <Link href={`/teams/${team.id}`} className="flex-1 ch-btn-primary py-4 text-[10px] flex items-center justify-center gap-2 group-hover:bg-slate-900">
                              View Roster <ChevronRight className="w-4 h-4" />
                           </Link>
                           {role !== "PUBLIC" && (
                             <button 
                               onClick={() => deleteTeam(team.id)}
                               className="w-12 h-12 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                             >
                                <Trash2 className="w-5 h-5" />
                             </button>
                           )}
                        </div>
                     </div>
                  </motion.div>
                ))}
             </AnimatePresence>

             {role !== "PUBLIC" && (
               <button 
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 text-slate-300 hover:border-orange-600/30 hover:text-orange-600 hover:bg-orange-50/10 transition-all group min-h-[400px]"
               >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-xl transition-all">
                     <Plus className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                     <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Elite Franchise</div>
                     <div className="text-lg font-black italic uppercase tracking-tighter">Add New SQUAD</div>
                  </div>
               </button>
             )}
          </div>
       </main>

       {/* Create Team Modal */}
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
                   <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                         <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-1">New Franchise Onboarding</h3>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Identity & Brand Registry</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-300 shadow-sm">
                         <X className="w-5 h-5" />
                      </button>
                   </div>

                   <form onSubmit={handleCreateTeam} className="p-10 space-y-8">
                      <div className="space-y-4">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Franchise Name</label>
                         <input 
                           className="ch-input py-5 text-sm uppercase font-black" 
                           placeholder="e.g. BENGALURU BULLS"
                           value={newTeam.name}
                           onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Short Code (3 Char)</label>
                            <input 
                              className="ch-input py-5 text-sm uppercase font-black" 
                              placeholder="e.g. BEN"
                              maxLength={3}
                              value={newTeam.shortName}
                              onChange={(e) => setNewTeam({...newTeam, shortName: e.target.value})}
                            />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Representing City</label>
                            <input 
                              className="ch-input py-5 text-sm font-black uppercase" 
                              placeholder="e.g. BENGALURU"
                              value={newTeam.city}
                              onChange={(e) => setNewTeam({...newTeam, city: e.target.value})}
                            />
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Primary Brand Color</label>
                         <div className="flex flex-wrap gap-4">
                            {["#f97316", "#2563eb", "#dc2626", "#16a34a", "#9333ea", "#0f172a"].map(c => (
                               <button 
                                 key={c}
                                 type="button"
                                 onClick={() => setNewTeam({...newTeam, primaryColor: c})}
                                 className={cn(
                                   "w-10 h-10 rounded-xl transition-all",
                                   newTeam.primaryColor === c ? "ring-4 ring-orange-50 scale-110 shadow-lg" : "scale-100 hover:scale-105"
                                 )}
                                 style={{ backgroundColor: c }}
                               />
                            ))}
                         </div>
                      </div>

                      <button type="submit" className="w-full ch-btn-primary py-6 text-sm flex items-center justify-center gap-3">
                         Finalize Registration <Shield className="w-5 h-5" />
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
    <DashboardLayout variant={role === "USER" ? "user" : "organiser"}>
       {Content}
    </DashboardLayout>
  );
}
