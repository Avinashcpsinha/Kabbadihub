"use client";

import React, { useState } from "react";
import RoleGate from "@/components/RoleGate";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenant } from "@/context/TenantContext";
import { 
  Plus, Search, ShieldCheck, ShieldAlert,
  Trash2, UserCheck, Power, PowerOff,
  Users, Shield, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SuperAdminRegistryPage() {
  const { tenants, createTenant, impersonateTenant, deleteTenant, updateTenantStatus } = useTenant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    primaryColor: "#f97316"
  });

  const getTenantStats = (tenantId: string) => {
    const teamKey = `kabaddihub_${tenantId}_teams`;
    const savedTeams = localStorage.getItem(teamKey);
    let teamCount = 0;
    let playerCount = 0;
    let raiders = 0;
    let defenders = 0;
    let ars = 0;

    if (savedTeams) {
      const teams = JSON.parse(savedTeams);
      teamCount = teams.length;
      teams.forEach((t: any) => {
        const players = t.players || [];
        playerCount += players.length;
        players.forEach((p: any) => {
          if (p.role === "RAIDER") raiders++;
          else if (p.role === "DEFENDER") defenders++;
          else if (p.role === "ALL_ROUNDER") ars++;
        });
      });
    }

    return { teamCount, playerCount, raiders, defenders, ars };
  };

  const filteredTenants = tenants.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTenant(formData.name, formData.city, formData.primaryColor);
    setIsModalOpen(false);
    setFormData({ name: "", city: "", primaryColor: "#f97316" });
  };

  return (
    <RoleGate allowedRoles={["SUPER_ADMIN"]}>
      <DashboardLayout variant="admin">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
              Organisation Registry
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Platform-wide administrative overview of all tenants.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3"
          >
            <Plus className="w-4 h-4" /> Register New Franchise
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <Search className="w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search organizations..."
            className="bg-transparent flex-1 outline-none text-sm font-bold text-slate-600 placeholder:text-slate-300"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tenant Table */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Franchise</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Teams</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Players</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Tactical Breakdown</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTenants.map((t) => {
                  const stats = getTenantStats(t.id);
                  return (
                    <tr key={t.id} className="group hover:bg-slate-50/30 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black italic text-white shadow-lg shrink-0"
                            style={{ backgroundColor: t.primaryColor }}
                          >
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-black uppercase tracking-tight text-slate-900">{t.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.city || "Multi-City"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {t.status === "ENABLED" ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3" /> Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                            <ShieldAlert className="w-3 h-3" /> Disabled
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black italic text-slate-900">{stats.teamCount}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black italic text-slate-900">{stats.playerCount}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Role Split</span>
                            <div className="flex items-center gap-2">
                               <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-black text-orange-600 italic">{stats.raiders}</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase">R</span>
                               </div>
                               <div className="w-px h-3 bg-slate-100" />
                               <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-black text-blue-600 italic">{stats.defenders}</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase">D</span>
                               </div>
                               <div className="w-px h-3 bg-slate-100" />
                               <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-black text-purple-600 italic">{stats.ars}</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase">AR</span>
                               </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => impersonateTenant(t.id)}
                            title="Impersonate"
                            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-100 hover:shadow-sm transition-all"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateTenantStatus(t.id, t.status === "ENABLED" ? "DISABLED" : "ENABLED")}
                            title={t.status === "ENABLED" ? "Deactivate" : "Activate"}
                            className={cn(
                              "p-2.5 bg-white border border-slate-100 rounded-xl transition-all",
                              t.status === "ENABLED" ? "text-slate-400 hover:text-amber-600 hover:border-amber-100" : "text-emerald-400 hover:text-emerald-600 hover:border-emerald-100"
                            )}
                          >
                            {t.status === "ENABLED" ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => {
                              if(confirm(`Are you sure you want to delete ${t.name}?`)) deleteTenant(t.id);
                            }}
                            title="Delete"
                            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-sm transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal remains the same */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
              >
                <div className="p-10">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Register Organisation</h2>
                  <p className="text-sm font-medium text-slate-500 mb-8">Setup a new sports franchise on the platform.</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Franchise Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 ring-red-500/20 transition-all"
                        placeholder="e.g. Haryana Steelers"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Base City</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 ring-red-500/20 transition-all"
                        placeholder="e.g. Panchkula"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-6 pt-6">
                      <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-2 px-12 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all"
                      >
                        Launch Franchise
                      </button>
                    </div>
                  </form>
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
