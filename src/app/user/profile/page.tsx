"use client";

import React, { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  User, Mail, MapPin, Target, Save, Camera, Shield,
  Calendar, Award, Heart, Activity, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function UserProfilePage() {
  const { currentUser, role, updateUser } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    city: "",
    position: "",
    height: "",
    weight: "",
    panCard: "",
    aadharCard: "",
  });

  React.useEffect(() => {
    if (role === "PUBLIC") {
      router.push("/login");
      return;
    }
    if (currentUser) {
      setForm({
        name: currentUser.name,
        bio: currentUser.bio || "",
        city: currentUser.city || "",
        position: currentUser.position || "",
        height: currentUser.height || "",
        weight: currentUser.weight || "",
        panCard: currentUser.panCard || "",
        aadharCard: currentUser.aadharCard || "",
      });
    }
  }, [role, router, currentUser]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateUser({
        name: form.name,
        bio: form.bio,
        city: form.city,
        position: form.position as any,
        height: form.height,
        weight: form.weight,
        panCard: form.panCard,
        aadharCard: form.aadharCard,
        avatarInitial: form.name.charAt(0).toUpperCase(),
      });
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  if (!currentUser) return null;

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="bg-white ch-card p-10 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-28 h-28 bg-orange-600 rounded-3xl flex items-center justify-center text-5xl font-black italic text-white shadow-2xl shadow-orange-600/20 overflow-hidden">
                  {currentUser.photoUrl ? (
                    <img src={currentUser.photoUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.avatarInitial
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-orange-600 transition-all shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">{currentUser.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {currentUser.email}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(currentUser.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                  {currentUser.position && (
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-100">
                      {currentUser.position.replace("_", " ")}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                    <Shield className="w-3 h-3 inline mr-1" /> Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white ch-card p-10">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 flex items-center gap-3">
              <User className="w-5 h-5 text-orange-600" /> Edit Profile
            </h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Display Name</label>
                  <input
                    type="text"
                    className="ch-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="ch-input !pl-12"
                      placeholder="Your City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Bio</label>
                <textarea
                  rows={3}
                  className="ch-input resize-none"
                  placeholder="Tell us about yourself..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Playing Position</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { val: "", label: "Fan Only" },
                    { val: "RAIDER", label: "Raider" },
                    { val: "DEFENDER", label: "Defender" },
                    { val: "ALL_ROUNDER", label: "All-Rounder" },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setForm({ ...form, position: p.val })}
                      className={cn(
                        "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                        form.position === p.val
                          ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20"
                          : "bg-white border-slate-200 text-slate-500 hover:border-orange-200"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                {saved && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Profile Updated Successfully!
                  </span>
                )}
                {!saved && <span />}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="ch-btn-primary px-8 py-4"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* Athlete Specific Section: Professional Stats & Experience */}
          {form.position && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-8"
            >
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="absolute bottom-0 right-0 p-12 opacity-5">
                   <Target className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                      <Award className="w-6 text-orange-500" /> Professional Overview
                   </h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                      {[
                        { label: "Matches Played", val: "0", sub: "Verified" },
                        { label: "Avg Raid Points", val: "0.0", sub: "Per Match" },
                        { label: "Not Out %", val: "0%", sub: "Efficiency" },
                        { label: "Elite Rating", val: "N/A", sub: "Global Rank" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                           <div className="text-2xl font-black italic mb-1">{stat.val}</div>
                           <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                           <div className="text-[8px] font-bold text-orange-500 mt-1 uppercase tracking-tighter">{stat.sub}</div>
                        </div>
                      ))}
                   </div>
                   <div className="space-y-6">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scouting Availability</span>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">Active</span>
                         </div>
                         <p className="text-sm font-medium text-slate-300 italic mb-6">"Set your availability and preferred league locations sofranchise owners can find you for trials."</p>
                         <button className="w-full py-4 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">
                            Manager Your Availability
                         </button>
                      </div>
                   </div>
                </div>
              </div>

              <div className="bg-white ch-card p-10">
                <h3 className="text-sm font-black italic uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-2 text-orange-600">
                   <Shield className="w-4 h-4" /> Physical & Experience Data
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Height (cm)</label>
                       <input 
                        type="number" 
                        placeholder="175" 
                        className="ch-input" 
                        value={form.height}
                        onChange={(e) => setForm({ ...form, height: e.target.value })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Weight (kg)</label>
                       <input 
                        type="number" 
                        placeholder="75" 
                        className="ch-input" 
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                       />
                    </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dominant Hand/Leg</label>
                      <select className="ch-input text-[10px] font-bold uppercase">
                         <option>Right</option>
                         <option>Left</option>
                         <option>Both</option>
                      </select>
                   </div>
                </div>

                <div className="bg-slate-50 ch-card p-10 border border-slate-100">
                  <h3 className="text-sm font-black italic uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Identity Credentials
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">PAN Card</label>
                      <input 
                        type="text" 
                        placeholder="ABCDE1234F" 
                        className="ch-input border-slate-200 bg-white" 
                        value={form.panCard}
                        onChange={(e) => setForm({ ...form, panCard: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">AADHAR Number</label>
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012" 
                        className="ch-input border-slate-200 bg-white" 
                        value={form.aadharCard}
                        onChange={(e) => setForm({ ...form, aadharCard: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-6 italic">KYC data is encrypted and used only for league verification purposes.</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PublicLayout>
  );
}
