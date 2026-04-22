"use client";

import React, { useState, useEffect } from "react";
import RoleGate from "@/components/RoleGate";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, Search, Plus, Trash2, Edit3, 
  ShieldCheck, ShieldAlert, Phone, Mail, 
  Trophy, Activity, ChevronRight, X,
  Save, SwitchCamera
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/types";

export default function GlobalPlayersPoolPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load global players
  useEffect(() => {
    const saved = localStorage.getItem("kabaddihub_global_players");
    if (saved) {
      setPlayers(JSON.parse(saved));
    } else {
      // Fetch the 50 player list from our "Seed" (mocked here for speed)
      // In a real app we'd pull from a shared constant
      // Generating with dummy phone/email for the 50 players
      const initial = Array.from({ length: 50 }).map((_, i) => ({
        id: `p${i + 1}`,
        name: i === 0 ? "Pawan Sehrawat" : i === 1 ? "Naveen Kumar" : `Player ${i + 1}`,
        number: `${Math.floor(Math.random() * 99)}`,
        phone: `+91 ${Math.floor(7000000000 + Math.random() * 2000000000)}`,
        email: `player${i + 1}@kabaddi.in`,
        role: i % 3 === 0 ? "RAIDER" : i % 3 === 1 ? "DEFENDER" : "ALL_ROUNDER",
        status: "ENABLED",
        stats: {
          raidPoints: Math.floor(Math.random() * 1500),
          tacklePoints: Math.floor(Math.random() * 500),
          matches: Math.floor(Math.random() * 150),
          superTens: Math.floor(Math.random() * 50),
          highFives: Math.floor(Math.random() * 20)
        }
      }));
      setPlayers(initial);
      localStorage.setItem("kabaddihub_global_players", JSON.stringify(initial));
    }
  }, []);

  const savePlayers = (updated: any[]) => {
    setPlayers(updated);
    localStorage.setItem("kabaddihub_global_players", JSON.stringify(updated));
  };

  const handleEdit = (player: any) => {
    setEditingPlayer({ ...player });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this player from the global pool?")) {
      savePlayers(players.filter(p => p.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    const updated = players.map(p => 
      p.id === id ? { ...p, status: p.status === "ENABLED" ? "DISABLED" : "ENABLED" } : p
    );
    savePlayers(updated);
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RoleGate allowedRoles={["SUPER_ADMIN"]}>
      <DashboardLayout variant="admin">
        <div className="p-6 md:p-10 space-y-8 pb-40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">Central Athlete Pool</h1>
              <p className="text-sm font-medium text-slate-500">Universal directory for all registered professional kabaddi players.</p>
            </div>
            <button className="px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all flex items-center gap-3">
              <Plus className="w-4 h-4" /> Add New Athlete
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <Search className="w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by name, role or contact..."
              className="bg-transparent flex-1 outline-none text-sm font-bold text-slate-600 placeholder:text-slate-300"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-6">Athlete Details</th>
                    <th className="px-8 py-6">Contact info</th>
                    <th className="px-8 py-6">Tactical Type</th>
                    <th className="px-8 py-6 text-center">Performance</th>
                    <th className="px-8 py-6 text-center">Control</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPlayers.map((p) => (
                    <tr key={p.id} className="group hover:bg-slate-50/30 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black italic text-white shadow-lg",
                            p.role === "RAIDER" ? "bg-orange-600" : p.role === "DEFENDER" ? "bg-blue-600" : "bg-purple-600"
                          )}>
                             {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-black uppercase tracking-tight text-slate-900">{p.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jersey #{p.number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                             <Phone className="w-3 h-3" /> {p.phone || "Not Registered"}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 lowercase italic">
                             <Mail className="w-3 h-3" /> {p.email || "no-contact@kabaddi.in"}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          p.role === "RAIDER" ? "bg-orange-50 text-orange-600" : p.role === "DEFENDER" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                        )}>
                          {p.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center">
                           <span className="text-sm font-black italic text-slate-900 leading-none">{(p.stats?.raidPoints || 0) + (p.stats?.tacklePoints || 0)}</span>
                           <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Points</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button 
                          onClick={() => toggleStatus(p.id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                            p.status === "ENABLED" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          )}
                        >
                          {p.status === "ENABLED" ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {p.status === "ENABLED" ? "Active" : "Banned"}
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => handleEdit(p)}
                             className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-sm transition-all"
                           >
                              <Edit3 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDelete(p.id)}
                             className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 transition-all"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {isModalOpen && editingPlayer && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
              >
                 <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-1">Athlete Dossier</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Universal Player Registry Management</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                 </div>

                 <div className="p-10 grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Full Professional Name</label>
                          <input 
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none" 
                            value={editingPlayer.name}
                            onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})}
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Primary Role</label>
                            <select 
                              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none"
                              value={editingPlayer.role}
                              onChange={e => setEditingPlayer({...editingPlayer, role: e.target.value})}
                            >
                               <option value="RAIDER">RAIDER</option>
                               <option value="DEFENDER">DEFENDER</option>
                               <option value="ALL_ROUNDER">ALL ROUNDER</option>
                            </select>
                          </div>
                          <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Jersey #</label>
                            <input 
                              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none" 
                              value={editingPlayer.number}
                              onChange={e => setEditingPlayer({...editingPlayer, number: e.target.value})}
                            />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Phone Number</label>
                          <input 
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none" 
                            value={editingPlayer.phone}
                            onChange={e => setEditingPlayer({...editingPlayer, phone: e.target.value})}
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Official Email ID</label>
                          <input 
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none" 
                            value={editingPlayer.email}
                            onChange={e => setEditingPlayer({...editingPlayer, email: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="md:col-span-2 pt-6 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <button 
                            className={cn(
                              "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                              editingPlayer.status === "ENABLED" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}
                            onClick={() => setEditingPlayer({...editingPlayer, status: editingPlayer.status === "ENABLED" ? "DISABLED" : "ENABLED"})}
                          >
                            Set {editingPlayer.status === "ENABLED" ? "BANNED" : "ACTIVE"}
                          </button>
                       </div>
                       <div className="flex items-center gap-4">
                          <button onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-6">Discard</button>
                          <button 
                            onClick={() => {
                               const updated = players.map(p => p.id === editingPlayer.id ? editingPlayer : p);
                               savePlayers(updated);
                               setIsModalOpen(false);
                            }}
                            className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3"
                          >
                             <Save className="w-4 h-4" /> Save Record
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        </div>
      </DashboardLayout>
    </RoleGate>
  );
}
