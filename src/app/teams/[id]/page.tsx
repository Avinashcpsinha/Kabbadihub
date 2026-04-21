"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  ArrowLeft, 
  Plus, 
  Search, 
  Zap, 
  Trophy, 
  Shield, 
  ChevronRight,
  TrendingUp,
  MapPin,
  X,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Team, Player } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function CricHeroesStyleTeamRosterPage() {
  const { id } = useParams();
  const { role } = useAuth();
  const { tenant } = useTenant();
  const [team, setTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "RAIDER" as Player["role"],
    number: ""
  });

  useEffect(() => {
    if (!tenant) return;
    const key = `kabaddihub_${tenant.id}_teams`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const allTeams: Team[] = JSON.parse(saved);
      const found = allTeams.find(t => t.id === id);
      if (found) setTeam(found);
    }
  }, [id, tenant]);

  const saveTeam = (updatedTeam: Team) => {
    if (!tenant) return;
    const key = `kabaddihub_${tenant.id}_teams`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const allTeams: Team[] = JSON.parse(saved);
      const updatedTeams = allTeams.map(t => t.id === id ? updatedTeam : t);
      localStorage.setItem(key, JSON.stringify(updatedTeams));
      setTeam(updatedTeam);
    }
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !newPlayer.name || !newPlayer.number) return;

    const player: Player = {
      id: `p_${Date.now()}`,
      name: newPlayer.name.toUpperCase(),
      role: newPlayer.role,
      number: newPlayer.number.padStart(2, '0'),
      stats: { raidPoints: 0, tacklePoints: 0, matches: 0, superTens: 0, highFives: 0 }
    };

    const updatedTeam = {
      ...team,
      players: [...(team.players || []), player]
    };

    saveTeam(updatedTeam);
    setIsModalOpen(false);
    setNewPlayer({ name: "", role: "RAIDER", number: "" });
  };

  if (!team) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 italic font-black uppercase tracking-widest">Franchise Data Not Found</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-40">
       {/* Top Navigation */}
       <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
             <div className="flex items-center gap-6">
                <Link href="/teams" className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-orange-600 transition-all">
                   <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                   <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 leading-none block">{team.name}</span>
                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Squad Roster & Contracts</span>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black italic text-white shadow-lg" style={{ backgroundColor: team.primaryColor }}>
                   {team.shortName}
                </div>
                {role !== "PUBLIC" && (
                   <button 
                     onClick={() => setIsModalOpen(true)}
                     className="ch-btn-primary py-3 hidden md:flex"
                   >
                      <Plus className="w-4 h-4" /> Sign Athlete
                   </button>
                )}
             </div>
          </div>
       </nav>

       <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          
          {/* Team Profile Banner */}
          <section className="bg-white ch-card overflow-hidden">
             <div className="h-40 relative group" style={{ backgroundColor: team.primaryColor + '20' }}>
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                   <Trophy className="w-64 h-64" />
                </div>
                <div className="absolute -bottom-10 left-10 w-32 h-32 rounded-[2.5rem] bg-white border-4 border-white shadow-2xl flex items-center justify-center text-4xl font-black italic" style={{ borderBottomColor: team.primaryColor }}>
                   <span style={{ color: team.primaryColor }}>{team.shortName}</span>
                </div>
             </div>
             <div className="p-10 pt-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                   <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">{team.name}</h1>
                   <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-orange-600" /> {team.city}</span>
                      <span className="text-slate-200">|</span>
                      <span>League ID: {id?.toString().slice(0, 8)}</span>
                   </div>
                </div>
                {role !== "PUBLIC" && (
                   <button onClick={() => setIsModalOpen(true)} className="md:hidden ch-btn-primary w-full py-4">Sign New Athlete</button>
                )}
             </div>
          </section>

          {/* Performance Overview */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { label: "Squad Depth", val: team.players?.length || 0, icon: <Users />, bg: "bg-blue-50", color: "text-blue-600" },
               { label: "Elite Raiders", val: team.players?.filter(p => p.role === "RAIDER").length || 0, icon: <Zap />, bg: "bg-orange-50", color: "text-orange-600" },
               { label: "Tackle Efficiency", val: "72%", icon: <Shield />, bg: "bg-purple-50", color: "text-purple-600" },
               { label: "Season Points", val: team.players?.reduce((acc, p) => acc + (p.stats.raidPoints + p.stats.tacklePoints), 0) || 0, icon: <TrendingUp />, bg: "bg-emerald-50", color: "text-emerald-600" }
             ].map((s, i) => (
               <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center`}>{s.icon}</div>
                  <div>
                     <div className="text-xl font-black italic text-slate-900 leading-none mb-0.5">{s.val}</div>
                     <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
                  </div>
               </div>
             ))}
          </section>

          {/* Roster Listing */}
          <section className="bg-white ch-card overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                   <Shield className="w-6 h-6 text-orange-600" />
                   Verified Roster
                </h2>
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Filter athletes..."
                    className="ch-input !pl-12 py-3 w-full md:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
             </div>

             <div className="divide-y divide-slate-50">
                {(team.players || []).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((player) => (
                   <Link key={player.id} href={`/players/${player.id}`} className="flex items-center justify-between p-6 px-8 hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-lg font-black italic text-orange-600 shadow-sm group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all">
                            {player.number}
                         </div>
                         <div>
                            <h4 className="text-lg font-black italic uppercase tracking-tight text-slate-900 leading-none mb-1">{player.name}</h4>
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              player.role === "RAIDER" ? "text-red-600" : 
                              player.role === "DEFENDER" ? "text-blue-600" : "text-emerald-600"
                            )}>
                               {player.role.replace("_", " ")}
                            </span>
                         </div>
                      </div>

                      <div className="flex items-center gap-12">
                         <div className="hidden md:block text-right">
                            <div className="text-lg font-black italic tabular-nums text-slate-900">{player.stats.raidPoints + player.stats.tacklePoints}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Pts</div>
                         </div>
                         <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                            <ChevronRight className="w-5 h-5" />
                         </div>
                      </div>
                   </Link>
                ))}

                {(!team.players || team.players.length === 0) && (
                   <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
                         <User className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No athletes signed for this franchise</p>
                      {role !== "PUBLIC" && (
                         <button onClick={() => setIsModalOpen(true)} className="ch-btn-outline py-3">Register First Athlete</button>
                      )}
                   </div>
                )}
             </div>
          </section>
       </main>

       {/* Signing Modal */}
       <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
               <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white ch-card max-w-lg w-full p-10 md:p-14 relative"
               >
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
                     <X className="w-6 h-6" />
                  </button>

                  <div className="mb-10 text-center md:text-left text-slate-900">
                     <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 leading-none flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-orange-600 rounded-full" /> Athlete Signing
                     </h3>
                     <p className="text-sm font-medium text-slate-500 italic">Draft and authorize a new athlete to the roster.</p>
                  </div>

                  <form onSubmit={handleAddPlayer} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Legal Full Name</label>
                        <input 
                          required 
                          type="text" 
                          placeholder="e.g. NAVIN KUMAR"
                          className="ch-input"
                          value={newPlayer.name}
                          onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Primary Role</label>
                           <select 
                             className="ch-input h-[54px] appearance-none"
                             value={newPlayer.role}
                             onChange={(e) => setNewPlayer({...newPlayer, role: e.target.value as any})}
                           >
                              <option value="RAIDER">RAIDER</option>
                              <option value="DEFENDER">DEFENDER</option>
                              <option value="ALL_ROUNDER">ALL ROUNDER</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Jersey Number</label>
                           <input 
                             required 
                             maxLength={2}
                             type="text" 
                             placeholder="01"
                             className="ch-input"
                             value={newPlayer.number}
                             onChange={(e) => setNewPlayer({...newPlayer, number: e.target.value})}
                           />
                        </div>
                     </div>

                     <button type="submit" className="w-full ch-btn-primary py-5 mt-4">
                        Confirm Legal Signing
                     </button>
                  </form>
               </motion.div>
            </div>
          )}
       </AnimatePresence>
    </div>
  );
}
