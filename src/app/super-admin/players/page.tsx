"use client";

import React, { useState, useEffect } from "react";
import RoleGate from "@/components/RoleGate";
import DashboardLayout from "@/components/DashboardLayout";
import AthleteRegistrationModal, { AthleteFormData } from "@/components/AthleteRegistrationModal";
import { 
  Search, Plus, Trash2, Edit3, 
  ShieldCheck, ShieldAlert, Phone, Mail, 
  Activity, IdCard, X, Save, Camera, MapPin,
  CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalPlayersPoolPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kabaddihub_global_players");
    if (saved) {
      setPlayers(JSON.parse(saved));
    } else {
      const initial = Array.from({ length: 50 }).map((_, i) => ({
        id: `p${i + 1}`,
        name: i === 0 ? "Pawan Sehrawat" : i === 1 ? "Naveen Kumar" : `Athlete ${i + 1}`,
        number: `${Math.floor(Math.random() * 99)}`,
        phone: `+91 ${Math.floor(7000000000 + Math.random() * 2000000000)}`,
        email: `player${i + 1}@kabaddi.in`,
        role: i % 3 === 0 ? "RAIDER" : i % 3 === 1 ? "DEFENDER" : "ALL_ROUNDER",
        status: "ENABLED",
        kycStatus: "PENDING",
        weight: "78",
        height: "178",
        city: "Rohtak",
        pan: "ABCDE1234F",
        aadhar: "1234 5678 9012",
        photo: `https://i.pravatar.cc/150?u=${i}`,
        stats: {
          raidPoints: Math.floor(Math.random() * 1500),
          tacklePoints: Math.floor(Math.random() * 500)
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

  const toggleStatus = (id: string) => {
    const updated = players.map(p => 
      p.id === id ? { ...p, status: p.status === "ENABLED" ? "DISABLED" : "ENABLED" } : p
    );
    savePlayers(updated);
  };

  const handleRegister = (data: AthleteFormData) => {
    const newPlayer = {
      ...data,
      stats: { raidPoints: 0, tacklePoints: 0 }
    };
    savePlayers([...players, newPlayer]);
    setIsRegisterOpen(false);
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
              <p className="text-sm font-medium text-slate-500">Managing global rosters, compliance and verified profiles.</p>
            </div>
            <button onClick={() => setIsRegisterOpen(true)} className="px-8 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-500 transition-all flex items-center gap-3">
              <Plus className="w-4 h-4" /> Register New Athlete
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <Search className="w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by name, contact or document..."
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
                    <th className="px-8 py-6">Athlete Profile</th>
                    <th className="px-8 py-6">Identity Docs</th>
                    <th className="px-8 py-6">Compliance</th>
                    <th className="px-8 py-6 text-center">Score Card</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPlayers.map((p) => (
                    <tr key={p.id} className="group hover:bg-slate-50/30 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-white" />
                          <div>
                            <div className="text-sm font-black uppercase tracking-tight text-slate-900">{p.name}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               JERSEY #{p.number} • {p.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase">
                             <IdCard className="w-3 h-3" /> PAN: {p.pan}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase">
                             <AlertCircle className="w-3 h-3" /> UID: {p.aadhar}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          p.kycStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-600" : p.kycStatus === "REJECTED" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                        )}>
                           {p.kycStatus === "VERIFIED" ? <CheckCircle2 className="w-3 h-3" /> : p.kycStatus === "REJECTED" ? <XCircle className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                           {p.kycStatus}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <span className="text-sm font-black italic text-slate-900">{(p.stats?.raidPoints || 0) + (p.stats?.tacklePoints || 0)}</span>
                         <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Pts</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => { setEditingPlayer({...p}); setIsModalOpen(true); }}
                             className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-100 transition-all"
                           >
                              <Edit3 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => toggleStatus(p.id)}
                             className={cn("p-2.5 bg-white border border-slate-100 rounded-xl transition-all", p.status === "ENABLED" ? "text-emerald-500" : "text-slate-300")}
                           >
                              {p.status === "ENABLED" ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
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

        <AnimatePresence>
          {isModalOpen && editingPlayer && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
              >
                 {/* Modal Header */}
                 <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-1">Athlete Full Dossier</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Universal Player Registry & Compliance System</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-300"><X className="w-6 h-6" /></button>
                 </div>

                 <div className="p-10 space-y-12">
                    {/* Top Identity Block */}
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                       <div className="relative group shrink-0">
                          <img src={editingPlayer.photo} className="w-48 h-48 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] flex items-center justify-center">
                             <Camera className="w-8 h-8 text-white" />
                          </div>
                          <div className="mt-4 flex gap-2">
                             <button 
                               onClick={() => setEditingPlayer({...editingPlayer, kycStatus: "VERIFIED"})}
                               className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", editingPlayer.kycStatus === "VERIFIED" ? "bg-emerald-600 text-white shadow-lg" : "bg-emerald-50 text-emerald-600")}
                             >Verify Photo</button>
                             <button 
                               onClick={() => setEditingPlayer({...editingPlayer, kycStatus: "REJECTED"})}
                               className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", editingPlayer.kycStatus === "REJECTED" ? "bg-red-600 text-white shadow-lg" : "bg-red-50 text-red-600")}
                             >Reject</button>
                          </div>
                       </div>
                       <div className="flex-1 grid md:grid-cols-2 gap-6 w-full">
                          <div className="space-y-4">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Full Legal Name</label>
                             <input className="ch-input py-5 text-sm uppercase font-black" value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Jersey Assignment</label>
                             <input className="ch-input py-5 text-sm font-black" value={editingPlayer.number} onChange={e => setEditingPlayer({...editingPlayer, number: e.target.value})} />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Primary Mobile</label>
                             <input className="ch-input py-5 text-sm font-black" value={editingPlayer.phone} onChange={e => setEditingPlayer({...editingPlayer, phone: e.target.value})} />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Professional Email</label>
                             <input className="ch-input py-5 text-sm font-medium" value={editingPlayer.email} onChange={e => setEditingPlayer({...editingPlayer, email: e.target.value})} />
                          </div>
                       </div>
                    </div>

                    {/* Physical & Regional Metrics */}
                    <div className="bg-slate-50 rounded-[3rem] p-10 grid md:grid-cols-3 gap-8">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Weight (KG)</label>
                          <input className="ch-input bg-white py-5 text-sm font-black" value={editingPlayer.weight} onChange={e => setEditingPlayer({...editingPlayer, weight: e.target.value})} />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Height (CM)</label>
                          <input className="ch-input bg-white py-5 text-sm font-black" value={editingPlayer.height} onChange={e => setEditingPlayer({...editingPlayer, height: e.target.value})} />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Base City</label>
                          <input className="ch-input bg-white py-5 text-sm font-black uppercase" value={editingPlayer.city} onChange={e => setEditingPlayer({...editingPlayer, city: e.target.value})} />
                       </div>
                    </div>

                    {/* Identity Compliance Block */}
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="bg-slate-900 p-8 rounded-[2.5rem] space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-2">
                             <IdCard className="w-4 h-4" /> Income Tax (PAN) Card
                          </label>
                          <input className="w-full bg-white/5 border-none rounded-2xl px-6 py-4 text-white text-sm font-black uppercase outline-none" value={editingPlayer.pan} onChange={e => setEditingPlayer({...editingPlayer, pan: e.target.value})} />
                          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Document Registry # Verified by System</div>
                       </div>
                       <div className="bg-slate-100 p-8 rounded-[2.5rem] space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-2">
                             <ShieldCheck className="w-4 h-4" /> National ID (Aadhar)
                          </label>
                          <input className="w-full bg-white border-none rounded-2xl px-6 py-4 text-slate-900 text-sm font-black outline-none" value={editingPlayer.aadhar} onChange={e => setEditingPlayer({...editingPlayer, aadhar: e.target.value})} />
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">12-Digit UID Integration Active</div>
                       </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                       <button onClick={() => setEditingPlayer({...editingPlayer, status: editingPlayer.status === "ENABLED" ? "DISABLED" : "ENABLED"})} className={cn("px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all", editingPlayer.status === "ENABLED" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                          {editingPlayer.status === "ENABLED" ? "Suspend Account" : "Reactivate Acc"}
                       </button>
                       <div className="flex gap-4">
                          <button onClick={() => setIsModalOpen(false)} className="px-8 font-black uppercase text-[10px] text-slate-400">Cancel</button>
                          <button onClick={() => { savePlayers(players.map(p => p.id === editingPlayer.id ? editingPlayer : p)); setIsModalOpen(false); }} className="px-12 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 hover:bg-black transition-all">
                             <Save className="w-4 h-4" /> Commit Profile
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Shared Registration Modal */}
        <AthleteRegistrationModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onSave={handleRegister}
          title="Enroll New Athlete"
          subtitle="Register a professional athlete into the Central Global Pool."
        />
      </DashboardLayout>
    </RoleGate>
  );
}
