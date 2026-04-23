"use client";

import React, { useState } from "react";
import {
  Zap, User, Mail, Lock, MapPin, Target,
  ChevronRight, ShieldCheck, ArrowLeft, CheckCircle2,
  AlertCircle, Eye, EyeOff, Camera, CreditCard, Info
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import UniversalHeader from "@/components/navigation/UniversalHeader";

function RegisterContent() {
  const { registerUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "athlete" ? "ATHLETE" : "FAN";

  const [accountType, setAccountType] = useState<"FAN" | "ATHLETE">(initialType);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    jersey: "",
    position: "",
    city: "",
    height: "",
    weight: "",
    panCard: "",
    aadharCard: "",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (accountType === "ATHLETE") {
      if (!formData.position) {
        setError("Please select your playing position to register as an Athlete.");
        return;
      }
      if (!formData.height || !formData.weight) {
        setError("Physical measurements (Height & Weight) are mandatory for professional registration.");
        return;
      }
      if (!formData.panCard || !formData.aadharCard) {
        setError("Legal identification (PAN & AADHAR) is required for athlete verification.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const user = await registerUser({
        ...formData,
        role: "USER"
      });

      if (!user) {
        setError("Registration failed. Email might be in use or data is invalid.");
        setIsLoading(false);
        return;
      }

      router.push("/user/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans flex flex-col">
      <UniversalHeader />

      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden"
          >
            {/* Form Header */}
            <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit mx-auto">
                    <button
                      type="button"
                      onClick={() => setAccountType("FAN")}
                      className={cn(
                        "px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        accountType === "FAN" ? "bg-white text-orange-600 shadow-xl" : "text-white/40 hover:text-white"
                      )}
                    >
                      Fan Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("ATHLETE")}
                      className={cn(
                        "px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        accountType === "ATHLETE" ? "bg-orange-600 text-white shadow-xl" : "text-white/40 hover:text-white"
                      )}
                    >
                      Pro Athlete
                    </button>
                  </div>

                  <div className="text-center">
                     <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
                        {accountType === "ATHLETE" ? "Join the Elite" : "Join the Tribe"}
                     </h1>
                     <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                        {accountType === "ATHLETE" ? "Official Professional Registration Pool" : "Standard Fan Enthusiast Account"}
                     </p>
                  </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-8">
              {/* Common Section */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                       <User className="w-4 h-4" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Basic Identity</h3>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        required
                        type="text"
                        placeholder="Full Legal Name"
                        className="ch-input !pl-6 w-full"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <input
                        required
                        type="email"
                        placeholder="Primary Email Address"
                        className="ch-input !pl-6 w-full"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        required
                        type={isVisible ? "text" : "password"}
                        placeholder="Create Password"
                        className="ch-input !pl-6 pr-12 w-full"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button type="button" onClick={() => setIsVisible(!isVisible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative text-slate-400">
                      <input
                        required
                        type="tel"
                        placeholder="Mobile (WhatsApp Connected)"
                        className="ch-input !pl-6 w-full"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                 </div>
              </div>

              {/* Dynamic Section: The fields that are common but tailored */}
              <div className="space-y-6 pt-4">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                       <Target className="w-4 h-4" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tactical & Bio Data</h3>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                       <select
                         required={accountType === "ATHLETE"}
                         className="ch-input !pl-6 w-full text-xs font-bold uppercase tracking-widest bg-slate-50 border-none"
                         value={formData.position}
                         onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                       >
                         <option value="">{accountType === "ATHLETE" ? "Primary Role *" : "Position (Optional)"}</option>
                         <option value="RAIDER">Raider</option>
                         <option value="DEFENDER">Defender</option>
                         <option value="ALL_ROUNDER">All-Rounder</option>
                       </select>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Representing City"
                        className="ch-input !pl-6 w-full"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                 </div>

                 <AnimatePresence>
                    {accountType === "ATHLETE" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 overflow-hidden pt-4"
                      >
                         <div className="grid md:grid-cols-3 gap-6">
                            <input
                              type="number"
                              placeholder="Jersey #"
                              className="ch-input !pl-6"
                              value={formData.jersey}
                              onChange={(e) => setFormData({ ...formData, jersey: e.target.value })}
                            />
                            <input
                              required
                              type="number"
                              placeholder="Height (CM) *"
                              className="ch-input !pl-6"
                              value={formData.height}
                              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            />
                            <input
                              required
                              type="number"
                              placeholder="Weight (KG) *"
                              className="ch-input !pl-6"
                              value={formData.weight}
                              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                         </div>

                         <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100/50 space-y-6">
                            <div className="flex items-center gap-3">
                               <CreditCard className="w-5 h-5 text-orange-600" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">Official Verification (KYC)</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                               <input
                                 required
                                 type="text"
                                 placeholder="PAN CARD NUMBER *"
                                 className="ch-input !bg-white border-orange-100 text-xs font-mono uppercase"
                                 value={formData.panCard}
                                 onChange={(e) => setFormData({ ...formData, panCard: e.target.value })}
                               />
                               <input
                                 required
                                 type="text"
                                 placeholder="AADHAR NUMBER *"
                                 className="ch-input !bg-white border-orange-100 text-xs font-mono"
                                 value={formData.aadharCard}
                                 onChange={(e) => setFormData({ ...formData, aadharCard: e.target.value })}
                               />
                            </div>
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              {error && (
                <div className="flex items-start gap-4 p-5 bg-red-50 rounded-3xl border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full ch-btn-primary py-6 text-xs flex items-center justify-center gap-4 bg-orange-600 hover:bg-orange-500 shadow-2xl shadow-orange-600/20"
              >
                {isLoading ? "Vetting Account..." : "Initiate Registration"}
                {!isLoading && <ChevronRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="p-10 bg-slate-50 border-t border-slate-100 text-center">
               <div className="flex flex-wrap justify-center gap-6 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-End Encrypted</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified Registry</span>
                  <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-blue-500" /> Organization Compliant</span>
               </div>
            </div>
          </motion.div>

          <div className="mt-12 text-center">
             <Link href="/register" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors">
                Are you an Organiser? <span className="text-orange-600 ml-2">Claim Franchise Portal</span>
             </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UserRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-black italic uppercase tracking-widest">Initializing Registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
