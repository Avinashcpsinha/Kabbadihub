"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import UniversalHeader from "./navigation/UniversalHeader";
import {
  Zap, Search, User, LogIn, Bell, Calendar,
  Users, Trophy, Activity, ChevronRight, LogOut,
  Camera, Video, Globe, Mail, Swords, BarChart3, Shield
} from "lucide-react";

const navLinks = [
  { label: "Match Schedules", href: "/matches?view=spectator" },
  { label: "Register Org", href: "/register" },
  { label: "Join as Athlete", href: "/user/register?type=athlete" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, currentUser, role, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Master Unified Header */}
      <UniversalHeader />

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
                  { label: "Matches", href: "/matches?view=spectator" },
                  { label: "Tournaments", href: "/tournaments?view=spectator" },
                  { label: "Teams", href: "/teams?view=spectator" },
                  { label: "Players", href: "/players?view=spectator" },
                ].map(l => (
                  <li key={l.href}><Link href={l.href} className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Community</h4>
              <ul className="space-y-3">
                {[
                  { label: "Challenges", href: "/challenges?view=spectator" },
                  { label: "Results", href: "/results?view=spectator" },
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
