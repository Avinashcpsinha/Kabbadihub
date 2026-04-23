"use client";

import React, { useState } from "react";
import { 
  Building2, 
  ChevronRight, 
  ShieldCheck, 
  Trophy, 
  Zap, 
  Mail, 
  Lock, 
  ImageIcon,
  CheckCircle2,
  ArrowLeft,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function OrganisationRegisterPage() {
  const { createTenant, setTenant } = useTenant();
  const { setRole } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "Mumbai",
    adminEmail: "",
    adminPassword: "",
    logoUrl: "",
    bannerUrl: "",
    primaryColor: "#f97316",
    secondaryColor: "#0f172a"
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newTenant = await createTenant(formData.name, formData.city, formData.primaryColor);
      if (newTenant) {
        setRole("ORGANISER");
        setTenant(newTenant);
        router.push("/organiser/dashboard");
      }
    } catch (err) {
      console.error("Organisation registration failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
       <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
             <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-600/20 group-hover:rotate-12 transition-transform">
                   <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-lg font-black italic uppercase tracking-tighter text-slate-900">KabaddiHub</span>
             </Link>
             <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2">
                   {[1, 2].map((i) => (
                     <div key={i} className={`w-8 h-1 rounded-full transition-colors ${step >= i ? "bg-orange-600" : "bg-slate-200"}`} />
                   ))}
                </div>
                <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-600 transition-colors">Sign In</Link>
             </div>
          </div>
       </header>

       <main className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
          <div className="max-w-xl w-full">
             <div className="bg-white ch-card p-10 md:p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                   <Building2 className="w-32 h-32" />
                </div>

                <AnimatePresence mode="wait">
                   {step === 1 ? (
                     <motion.div 
                       key="step1"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       className="space-y-8"
                     >
                        <div className="text-center md:text-left">
                           <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Create Organization</h1>
                           <p className="text-sm font-medium text-slate-500">Establish your official sports body on the digital mat.</p>
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Organization Name</label>
                              <div className="relative">
                                 <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                 <input 
                                   required
                                   type="text" 
                                   placeholder="e.g. Haryana Kabaddi Federation"
                                   className="ch-input !pl-12"
                                   value={formData.name}
                                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                                 />
                              </div>
                           </div>

                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Admin Email</label>
                                 <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                      required
                                      type="email" 
                                      placeholder="admin@leaguename.com"
                                      className="ch-input !pl-12"
                                      value={formData.adminEmail}
                                      onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                                    />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Secure Password</label>
                                 <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                      required
                                      type="password" 
                                      placeholder="••••••••"
                                      className="ch-input !pl-12"
                                      value={formData.adminPassword}
                                      onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                                    />
                                 </div>
                              </div>
                           </div>

                           <button 
                             onClick={nextStep}
                             disabled={!formData.name || !formData.adminEmail}
                             className="w-full ch-btn-primary py-5 mt-4 group"
                           >
                             Continue to Branding <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                           </button>
                        </div>
                     </motion.div>
                   ) : (
                     <motion.div 
                       key="step2"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="space-y-8"
                     >
                        <button onClick={prevStep} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 mb-4 transition-colors">
                           <ArrowLeft className="w-3 h-3" /> Step 1: Account
                        </button>
                        
                        <div className="text-center md:text-left">
                           <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Portal Branding</h2>
                           <p className="text-sm font-medium text-slate-500">Customize your workspace with official league assets.</p>
                        </div>

                        <div className="space-y-6">
                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Official Logo URL</label>
                                 <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                      type="text" 
                                      placeholder="https://..."
                                      className="ch-input !pl-12"
                                      value={formData.logoUrl}
                                      onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                                    />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Portal Banner URL</label>
                                 <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                      type="text" 
                                      placeholder="https://..."
                                      className="ch-input !pl-12"
                                      value={formData.bannerUrl}
                                      onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-6">
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-200">
                                 <div className="w-8 h-8 rounded-full bg-orange-600 shadow-lg shadow-orange-600/20" />
                              </div>
                              <div>
                                 <div className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">Theme Configurator</div>
                                 <div className="text-[10px] font-medium text-slate-500">Branding will be automatically injected into your private dashboard.</div>
                              </div>
                           </div>

                           <button 
                             onClick={handleSubmit}
                             disabled={isSubmitting}
                             className="w-full ch-btn-primary py-5 shadow-xl shadow-orange-600/20 disabled:opacity-50"
                           >
                             {isSubmitting ? (
                               <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Provisioning...</span>
                             ) : (
                               <span className="flex items-center gap-2">Finalize Registration <ShieldCheck className="w-4 h-4" /></span>
                             )}
                           </button>
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </div>
       </main>

       <footer className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Certified Sports Engine • 2026 KabaddiHub</p>
          </div>
       </footer>
    </div>
  );
}
