"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import {
  Zap, Activity, Mail, Menu, X, LogOut,
  User, Shield, BarChart3, Bell, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  showManagementPortal?: boolean;
  variant?: "admin" | "user" | "organiser" | "public";
}

export default function UniversalHeader({ 
  onMobileMenuToggle, 
  showManagementPortal = false,
  variant = "public"
}: HeaderProps) {
  const pathname = usePathname();
  const { logout, currentUser, role, isAuthenticated } = useAuth();
  const { tenant, isSuperAdmin, exitImpersonation } = useTenant();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: "Match Schedules", href: "/matches?view=spectator" },
    { label: "Register Org", href: "/register" },
    { label: "Join as Athlete", href: "/user/register?type=athlete" },
  ];

  return (
    <div className={cn(
      "sticky z-[100] shadow-sm transition-all duration-300",
      isSuperAdmin && tenant ? "top-[44px]" : "top-0"
    )}>
      {/* Tier 1: Dark Informational Bar */}
      <div className="bg-slate-950 text-white/60 py-2.5 px-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
            <Mail className="w-3 h-3 text-orange-500" /> support@kabaddihub.com
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
            <Activity className="w-3 h-3 text-orange-500" /> Global Live Mat Feed
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
            {role === "SUPER_ADMIN" ? "God Mode: Active" : "Identity Verified"}
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
               {isAuthenticated ? `Hi, ${currentUser?.name.split(" ")[0]}` : "Guest Access"}
             </span>
             {showManagementPortal && (isSuperAdmin || role === "SUPER_ADMIN") && variant === "organiser" && (
               <button
                 onClick={exitImpersonation}
                 className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-500"
               >
                 [ Exit Portal ]
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Tier 2: Unified Navbar */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-4 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4 xl:gap-10">
              {onMobileMenuToggle && (
                <button 
                  onClick={onMobileMenuToggle}
                  className="lg:hidden p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                >
                  <Menu className="w-5 h-5 text-slate-600" />
                </button>
              )}

              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20 group-hover:rotate-12 transition-transform">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <span className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">KabaddiHub</span>
              </Link>

              <div className="hidden xl:flex items-center gap-8">
                {navLinks.map(l => (
                  <Link 
                    key={l.label} 
                    href={l.href} 
                    className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                      pathname.startsWith(l.href.split('?')[0]) ? "text-orange-600" : "text-slate-400 hover:text-orange-600"
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
           </div>

           <div className="flex items-center gap-4">
              {showManagementPortal && (
                <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                  <span className="text-[11px] font-black text-slate-900 uppercase">Management Portal</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                    {variant === "admin" ? "SuperAdmin Console" : (tenant?.name || "Official Console")}
                  </span>
                </div>
              )}

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all border border-slate-200 shadow-sm"
                  >
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-black">
                      {currentUser?.avatarInitial}
                    </div>
                    <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-900">
                      My Account
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 transition-all origin-top-right"
                        >
                          <div className="p-4 border-b border-slate-100">
                            <div className="text-sm font-black italic text-slate-900 leading-none">{currentUser?.name}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{currentUser?.email}</div>
                          </div>
                          <div className="p-2">
                            {role === "USER" && (
                              <>
                                <Link href="/user/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                  <Activity className="w-4 h-4 text-slate-400" /> {currentUser?.position ? "Pro Dashboard" : "Fan Dashboard"}
                                </Link>
                                <Link href="/user/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                  <User className="w-4 h-4 text-slate-400" /> My Profile
                                </Link>
                              </>
                            )}
                            {role === "SUPER_ADMIN" && (
                              <Link href="/super-admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all">
                                <Shield className="w-4 h-4" /> Director Console
                              </Link>
                            )}
                            {role === "ORGANISER" && (
                              <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-orange-600 hover:bg-orange-50 transition-all">
                                <BarChart3 className="w-4 h-4" /> Management Console
                              </Link>
                            )}
                            <button onClick={() => { setUserMenuOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all">
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="ch-btn-outline px-6 py-2.5 text-[10px] shadow-sm">
                    Sign In
                  </Link>
                  <Link href="/user/register?type=athlete" className="ch-btn-primary px-6 py-2.5 text-[10px] shadow-sm shadow-orange-600/20">
                    Register
                  </Link>
                </div>
              )}
           </div>
        </div>
      </nav>
    </div>
  );
}
