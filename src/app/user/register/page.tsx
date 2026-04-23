"use client";

import React, { useState } from "react";
import {
  Zap, User, Mail, Lock, MapPin, Target,
  ChevronRight, ShieldCheck, ArrowLeft, CheckCircle2,
  AlertCircle, Eye, EyeOff, Camera
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

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
        role: accountType === "ATHLETE" ? "USER" : "USER", // Both start as USER, but Athlete info is in profile
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-lg font-black italic uppercase tracking-tighter text-slate-900">KabaddiHub</span>
          </Link>
          <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 flex items-center gap-1 transition-colors">
            Already have an account? <span className="text-orange-600 ml-1">Sign In</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white ch-card p-8 md:p-10"
          >
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setAccountType("FAN")}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    accountType === "FAN" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Register as Fan
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("ATHLETE")}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    accountType === "ATHLETE" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Join as Pro
                </button>
              </div>

              <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 relative">
                {accountType === "ATHLETE" ? (
                  <Target className="w-10 h-10 text-orange-600" />
                ) : (
                  <User className="w-10 h-10 text-orange-600" />
                )}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-100">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={accountType}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">
                    {accountType === "ATHLETE" ? "Enter the Arena" : "Join the Fanbase"}
                  </h1>
                  <p className="text-sm font-medium text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    {accountType === "ATHLETE" 
                      ? "Create your professional athlete profile and get scouted by top franchises." 
                      : "The ultimate digital experience for Kabaddi fans worldwide."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Kumar"
                    className="ch-input !pl-12"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    placeholder="you@email.com"
                    className="ch-input !pl-12"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type={isVisible ? "text" : "password"}
                    placeholder="••••••••"
                    className="ch-input !pl-12 pr-12"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setIsVisible(!isVisible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Mobile Number *</label>
                  <input
                    required={accountType === "ATHLETE"}
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="ch-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Jersey Number</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. 17"
                    className="ch-input"
                    value={formData.jersey}
                    onChange={(e) => setFormData({ ...formData, jersey: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-1",
                    accountType === "ATHLETE" ? "text-orange-600" : "text-slate-400"
                  )}>
                    Position {accountType === "ATHLETE" ? "*" : "(Optional)"}
                  </label>
                  <select
                    required={accountType === "ATHLETE"}
                    className={cn(
                      "ch-input text-xs font-bold uppercase tracking-widest",
                      accountType === "ATHLETE" && "border-orange-200 bg-orange-50/20"
                    )}
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  >
                    <option value="">{accountType === "ATHLETE" ? "Select Role" : "I'm a Fan"}</option>
                    <option value="RAIDER">Raider</option>
                    <option value="DEFENDER">Defender</option>
                    <option value="ALL_ROUNDER">All-Rounder</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Representing City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Your City"
                      className="ch-input !pl-12 text-sm"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {accountType === "ATHLETE" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                             <Camera className="w-5 h-5 text-orange-600" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Profile Photo</span>
                       </div>
                       <button type="button" className="text-[9px] font-black uppercase text-orange-600 hover:underline">Upload</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Height (cm) *</label>
                        <input
                          type="number"
                          placeholder="e.g. 180"
                          className="ch-input"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Weight (kg) *</label>
                        <input
                          type="number"
                          placeholder="e.g. 75"
                          className="ch-input"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Legal Verification</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">PAN Card *</label>
                            <input
                              type="text"
                              maxLength={10}
                              placeholder="ABCDE1234F"
                              className="ch-input text-xs uppercase font-mono"
                              value={formData.panCard}
                              onChange={(e) => setFormData({ ...formData, panCard: e.target.value })}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">AADHAR Number *</label>
                            <input
                              type="text"
                              maxLength={12}
                              placeholder="1234 5678 9012"
                              className="ch-input text-xs font-mono"
                              value={formData.aadharCard}
                              onChange={(e) => setFormData({ ...formData, aadharCard: e.target.value })}
                            />
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full ch-btn-primary py-5 text-sm">
                {isLoading ? "Creating Account..." : "Create My Account"}
                {!isLoading && <ChevronRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Are you a League Organiser?</p>
              <Link href="/register" className="ch-btn-outline w-full py-3 block text-center">
                Register Your Organisation
              </Link>
            </div>
          </motion.div>

           <div className="mt-6 flex justify-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-300">
             <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Secure</span>
             <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Free</span>
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

export default function UserRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-black italic uppercase tracking-widest">Initializing Registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
