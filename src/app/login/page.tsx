"use client";

import React, { useState } from "react";
import { 
  Zap, 
  ArrowLeft, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CricHeroesStyleLoginPage() {
  const { setTenant, tenants, setIsSuperAdmin } = useTenant();
  const { loginUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    setIsAuthenticating(true);
    
    // Safety Timeout: Reset if login takes more than 10 seconds
    const timeout = setTimeout(() => {
      if (isAuthenticating) {
        setIsAuthenticating(false);
        setIsError(true);
        setErrorMessage("Login session timed out. Please check your connection and try again.");
      }
    }, 10000);

    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        // Redirection will happen naturally but we can force it
        router.push("/user/dashboard");
      } else {
        setIsError(true);
        setErrorMessage(result.error || "Invalid credentials. Please check your Email and Password.");
      }
    } catch (err) {
      console.error("Login crash caught:", err);
      setIsError(true);
      setErrorMessage("A critical network error occurred. Please refresh and try again.");
    } finally {
      clearTimeout(timeout);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
       {/* Top Static Header */}
       <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
             <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                   <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-lg font-black italic uppercase tracking-tighter text-slate-900">KabaddiHub</span>
             </Link>
             <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Back Home
             </Link>
          </div>
       </header>

       <main className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
          <div className="max-w-md w-full">
             <div className="bg-white ch-card p-8 md:p-10">
                <div className="text-center mb-10">
                   <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Portal Login</h1>
                   <p className="text-sm font-medium text-slate-500">Manage your organization rosters and live scoring.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email / User ID</label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <input 
                           required 
                           type="email" 
                           placeholder="admin@leaguename.com"
                           className="ch-input !pl-12"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                         <Link href="#" className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest">Forgot?</Link>
                      </div>
                      <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <input 
                           required 
                           type={isVisible ? "text" : "password"} 
                           placeholder="••••••••"
                           className="ch-input !pl-12 pr-12"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                         />
                         <button 
                           type="button"
                           onClick={() => setIsVisible(!isVisible)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                         >
                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                         </button>
                      </div>
                   </div>

                   {isError && (
                     <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {errorMessage}
                     </div>
                   )}

                   <button 
                     type="submit" 
                     disabled={isAuthenticating}
                     className="w-full ch-btn-primary py-4 text-sm"
                   >
                     {isAuthenticating ? "Verifying..." : "Sign In to Portal"}
                     {!isAuthenticating && <ChevronRight className="w-4 h-4" />}
                   </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">New Organization?</p>
                   <Link href="/register" className="ch-btn-outline w-full py-4 block">Apply for League Registration</Link>
                </div>
             </div>

             <div className="mt-8 text-center flex flex-col items-center gap-4">
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Enterprise Access
                </span>
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
