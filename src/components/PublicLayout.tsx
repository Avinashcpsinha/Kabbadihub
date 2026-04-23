"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Zap, Search, User, LogIn, Bell, Calendar,
  Users, Trophy, Activity, ChevronRight, LogOut,
  Camera, Video, Globe, Mail, Swords, BarChart3, Shield
} from "lucide-react";

const navLinks = [
  { label: "Matches", href: "/matches" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Players", href: "/players" },
  { label: "Teams", href: "/teams" },
  { label: "Results", href: "/results" },
  { label: "Challenges", href: "/challenges" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, currentUser, role, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20 group-hover:rotate-12 transition-transform">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">KabaddiHub</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    pathname.startsWith(l.href) ? "text-orange-600" : "text-slate-400 hover:text-orange-600"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input placeholder="Search..." className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none w-32 text-slate-900 placeholder:text-slate-300" />
            </div>

            <div className="hidden lg:flex items-center gap-2 mr-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                {isAuthenticated ? "Session Active:" : "Portal Status:"}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {isAuthenticated ? `Hi, ${currentUser?.name.split(" ")[0]}` : "Welcome, Guest"}
              </span>
            </div>

            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                >
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white text-xs font-black">
                    {currentUser.avatarInitial}
                  </div>
                  <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-600">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                      <div className="p-4 border-b border-slate-100">
                        <div className="text-sm font-black italic text-slate-900">{currentUser.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.email}</div>
                      </div>
                      <div className="p-2">
                        {role === "USER" && (
                          <>
                            <Link href="/user/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                              <Activity className="w-4 h-4 text-slate-400" /> {currentUser.position ? "Pro Dashboard" : "Fan Dashboard"}
                            </Link>
                            <Link href="/user/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                              <User className="w-4 h-4 text-slate-400" /> My Profile
                            </Link>
                          </>
                        )}
                        {(role === "ORGANISER" || role === "SUPER_ADMIN") && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-orange-600 hover:bg-orange-50 transition-all">
                            <BarChart3 className="w-4 h-4" /> Management Console
                          </Link>
                        )}
                        {role === "SUPER_ADMIN" && (
                          <Link href="/super-admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all">
                            <Shield className="w-4 h-4" /> Platform Control
                          </Link>
                        )}
                        <button onClick={() => { setUserMenuOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/user/register" className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors">
                  Register
                </Link>
                <Link href="/login" className="ch-btn-primary px-6 py-3 shadow-lg shadow-orange-600/10">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1">{children}</div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-8 pt-16 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xl font-black italic tracking-tighter uppercase text-slate-900">KabaddiHub</span>
              </Link>
              <p className="text-sm text-slate-500 leading-relaxed">Elevating Kabaddi through world-class digital infrastructure.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Platform</h4>
              <ul className="space-y-3">
                {[
                  { label: "Matches", href: "/matches" },
                  { label: "Tournaments", href: "/tournaments" },
                  { label: "Teams", href: "/teams" },
                  { label: "Players", href: "/players" },
                ].map(l => (
                  <li key={l.href}><Link href={l.href} className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Community</h4>
              <ul className="space-y-3">
                {[
                  { label: "Challenges", href: "/challenges" },
                  { label: "Results", href: "/results" },
                  { label: "Clubs", href: "/clubs" },
                  { label: "Register", href: "/user/register" },
                ].map(l => (
                  <li key={l.href}><Link href={l.href} className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Governance</h4>
              <ul className="space-y-3">
                {[
                  { label: "Manage League", href: "/login" },
                  { label: "API Portal", href: "/developers" },
                  { label: "Register Org", href: "/register" },
                ].map(l => (
                  <li key={l.href}><Link href={l.href} className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">© 2026 KabaddiHub Digital Services.</div>
            <div className="flex gap-8">
              {["Privacy", "Terms", "Legal"].map(l => (
                <span key={l} className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-orange-600 transition-colors cursor-pointer">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
