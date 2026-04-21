"use client";

import React, { useState, useEffect } from "react";
import RoleGate from "@/components/RoleGate";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Building2, Users, Trophy, Activity, Plus, Search, 
  MoreVertical, ShieldCheck, AlertCircle, ExternalLink,
  Trash2, Edit3, CheckCircle2, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SuperAdminRegistryPage() {
  const { tenants, createTenant, impersonateTenant } = useTenant();
  const { role } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    primaryColor: "#f97316"
  });


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
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
              Tenant Registry
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Manage and oversee all organizations on the KabaddiHub platform.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all flex items-center gap-3"
          >
            <Plus className="w-4 h-4" /> Register New Tenant
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <Search className="w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search by name, city or ID..."
            className="bg-transparent flex-1 outline-none text-sm font-medium text-slate-600 placeholder:text-slate-300"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tenant Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTenants.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm group hover:border-red-200 transition-all relative overflow-hidden"
              >
                {/* Background Decor */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 blur-[40px] opacity-10 rounded-full"
                  style={{ backgroundColor: t.primaryColor }}
                />

                <div className="flex items-center justify-between mb-8">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black italic text-white shadow-lg"
                    style={{ backgroundColor: t.primaryColor }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic border",
                      t.status === "ENABLED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                    )}>
                      {t.status}
                    </span>
                    <button className="p-2 text-slate-200 hover:text-slate-400 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-8">
                  <h3 className="text-xl font-black italic uppercase text-slate-900 leading-none">{t.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.city || "Multi-City"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 pt-8 border-t border-slate-50">
                  <div className="text-center">
                    <div className="text-lg font-black italic text-slate-900 tabular-nums">12</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black italic text-slate-900 tabular-nums">48</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase">Players</div>
                  </div>
                </div>

                <button 
                  onClick={() => impersonateTenant(t.id)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10"
                >
                  <ShieldAlert className="w-4 h-4" /> Impersonate Tenant
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTenants.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-black italic uppercase text-slate-900 mb-2">No Tenants Match</h3>
              <p className="text-sm text-slate-400 italic">Adjust your search to find the organisation you're looking for.</p>
            </div>
          )}
        </div>

        {/* Register Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setIsModalOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 md:p-10 relative z-10 shadow-2xl"
              >
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 flex items-center gap-3">
                  <Plus className="w-6 h-6 text-red-600" /> Register Organisation
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Organisation Name</label>
                    <input 
                      required
                      type="text"
                      className="ch-input"
                      placeholder="e.g. Pro Kabaddi League"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Base City</label>
                    <input 
                      required
                      type="text"
                      className="ch-input"
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Brand Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color"
                        className="w-12 h-12 rounded-xl cursor-pointer"
                        value={formData.primaryColor}
                        onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                      />
                      <input 
                        type="text"
                        className="ch-input flex-1 font-mono uppercase"
                        value={formData.primaryColor}
                        onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-8 py-5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all"
                    >
                      Create Tenant
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
    </RoleGate>
  );
}
