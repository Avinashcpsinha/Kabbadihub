"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Settings, Building2, Palette, Globe, Lock, Save, 
  Trash2, Upload, CheckCircle2, AlertCircle, Shield,
  Mail, Phone, MapPin, Camera
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSettingsPage() {
  const { tenant, updateTenant } = useTenant();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"GENERAL" | "BRANDING" | "SECURITY">("GENERAL");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    primaryColor: "#f97316",
    secondaryColor: "#0f172a",
    email: "",
    phone: "",
    status: "ACTIVE" as any
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || "",
        city: tenant.city || "",
        primaryColor: tenant.primaryColor || "#f97316",
        secondaryColor: tenant.secondaryColor || "#0f172a",
        email: tenant.email || "",
        phone: tenant.phone || "",
        status: tenant.status || "ACTIVE"
      });
    }
  }, [tenant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    
    setIsSaving(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      updateTenant({
        ...tenant,
        ...formData
      });
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <DashboardLayout variant="organiser">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
            Settings
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Customize your organization presence and security.
          </p>
        </div>

        {/* Settings Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit shadow-sm">
          {[
            { id: "GENERAL", label: "General Info", icon: <Building2 className="w-3.5 h-3.5" /> },
            { id: "BRANDING", label: "Branding", icon: <Palette className="w-3.5 h-3.5" /> },
            { id: "SECURITY", label: "Security", icon: <Lock className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {activeTab === "GENERAL" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 space-y-8 shadow-sm">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Organization Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      className="ch-input !pl-12"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Headquarters City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      className="ch-input !pl-12"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      className="ch-input !pl-12"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      className="ch-input !pl-12"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "BRANDING" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 space-y-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-12">
                <div className="space-y-6 flex-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Custom Theme</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Primary Color</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="color" 
                          className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 overflow-hidden"
                          value={formData.primaryColor}
                          onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                        />
                        <input 
                          type="text" 
                          className="ch-input font-mono flex-1"
                          value={formData.primaryColor}
                          onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Secondary Color</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="color" 
                          className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 overflow-hidden"
                          value={formData.secondaryColor}
                          onChange={e => setFormData({...formData, secondaryColor: e.target.value})}
                        />
                        <input 
                          type="text" 
                          className="ch-input font-mono flex-1"
                          value={formData.secondaryColor}
                          onChange={e => setFormData({...formData, secondaryColor: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Logo & Asset</h3>
                  <div className="flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] p-10 group hover:border-orange-200 transition-all cursor-pointer">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 group-hover:bg-orange-50 transition-all">
                        <Camera className="w-8 h-8 text-slate-300 group-hover:text-orange-500" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Click to upload logo</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "SECURITY" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 space-y-8 shadow-sm">
              <div className="max-w-2xl space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-600" /> Administrative Access
                  </h3>
                  <p className="text-xs text-slate-500 italic">Configure who can manage this organization's data.</p>
                  <button type="button" className="ch-btn-outline px-6 py-3">Add Staff Member</button>
                </div>

                <div className="space-y-4 pt-8 border-t border-slate-100">
                  <h3 className="text-sm font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Danger Zone
                  </h3>
                  <p className="text-xs text-slate-500 italic">Temporary deactivate or request deletion of this organization. Data cannot be recovered after deletion.</p>
                  <div className="flex gap-4">
                    <button type="button" className="px-6 py-3 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900">Deactivate Org</button>
                    <button type="button" className="px-6 py-3 bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 transition-all">Delete Forever</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-6">
            <button 
              type="submit" 
              disabled={isSaving}
              className="ch-btn-primary px-10 py-5 shadow-2xl shadow-orange-600/20"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving Settings..." : "Save Configuration"}
            </button>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                    message.type === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                  )}
                >
                  {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
