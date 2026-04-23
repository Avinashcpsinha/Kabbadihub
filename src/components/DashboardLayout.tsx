"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import {
  Zap, LayoutDashboard, Users, Trophy, Target, ShoppingBag,
  PieChart, Settings, LogOut, ChevronLeft, ChevronRight,
  ShieldAlert, Building2, Activity, FileText, Menu, X,
  Gavel, MapPin, Megaphone, BarChart3, Shield, Eye, Camera
} from "lucide-react";
import { 
  SUPER_ADMIN_NAV, 
  ORGANISER_NAV, 
  ATHLETE_NAV, 
  FAN_NAV, 
  ICON_MAP 
} from "@/config/navigation";
import MatchSelectorModal from "./scoring/MatchSelectorModal";

// Navigation definitions moved to @/config/navigation.ts

export default function DashboardLayout({
  children,
  variant = "organiser",
}: {
  children: React.ReactNode;
  variant?: "organiser" | "admin" | "user";
}) {
  const pathname = usePathname();
  const { logout, currentUser, role: userRole } = useAuth();
  const { tenant, isSuperAdmin, exitImpersonation } = useTenant();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMatchSelectorOpen, setIsMatchSelectorOpen] = useState(false);

  const getNavItems = () => {
    if (userRole === "SUPER_ADMIN" && variant === "admin") return SUPER_ADMIN_NAV;
    if (userRole === "ORGANISER") return ORGANISER_NAV;
    if (userRole === "USER") {
      return currentUser?.position ? ATHLETE_NAV : FAN_NAV;
    }
    // Fallback to organiser nav if variant is organiser
    if (variant === "organiser") return ORGANISER_NAV;
    return FAN_NAV;
  };

  const navItems = getNavItems();
  const accentColor = variant === "admin" ? "red" : variant === "user" ? "slate" : "orange";

  const isActive = (href: string) => {
    if (href === "/admin" && pathname === "/admin") return true;
    if (href === "/super-admin" && pathname === "/super-admin") return true;
    if (href !== "/admin" && href !== "/super-admin" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-10 left-0 h-[calc(100vh-2.5rem)] bg-white border-r border-slate-200 z-[70] flex flex-col transition-all duration-300",
          isCollapsed ? "w-[80px]" : "w-[280px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn("p-6 border-b border-slate-100 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <Link href={variant === "admin" ? "/super-admin" : variant === "user" ? "/user/dashboard" : "/admin"} className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                variant === "admin" ? "bg-red-600 shadow-red-600/20" : 
                variant === "user" ? "bg-slate-900 shadow-slate-900/20" : 
                "bg-orange-600 shadow-orange-600/20"
              )}>
                {variant === "admin" ? <ShieldAlert className="w-5 h-5" /> : 
                 variant === "user" ? (currentUser?.photoUrl ? <img src={currentUser.photoUrl} alt="Profile" className="w-full h-full object-cover rounded-xl" /> : <Users className="w-5 h-5" />) :
                 <Zap className="w-5 h-5 fill-current" />}
              </div>
              <div>
                <div className="text-sm font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                  {variant === "admin" ? "System Director" : 
                   variant === "user" ? currentUser?.name.split(" ")[0] :
                   (tenant?.name || "KabaddiHub")}
                </div>
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                  {variant === "admin" ? "Global Governance" : 
                   variant === "user" ? (currentUser?.position ? `${currentUser.position} PRO` : "FAN ACCOUNT") :
                   "Organisation Console"}
                </div>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white",
              variant === "admin" ? "bg-red-600" : "bg-orange-600"
            )}>
              {variant === "admin" ? <ShieldAlert className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-current" />}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isScoring = item.href === "/scoring";

            const LinkOrButton: any = isScoring ? "button" : Link;
            const props = isScoring ? {
              onClick: () => {
                setIsMobileOpen(false);
                setIsMatchSelectorOpen(true);
              },
              type: "button"
            } : {
              href: item.href,
              onClick: () => setIsMobileOpen(false)
            };

            return (
              <LinkOrButton
                key={item.href}
                {...props}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group text-sm font-bold w-full text-left",
                  isActive(item.href) && !isScoring
                    ? variant === "admin"
                      ? "bg-red-50 text-red-600 shadow-sm"
                      : "bg-orange-50 text-orange-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={cn(
                  "shrink-0 transition-colors",
                  isActive(item.href) && !isScoring
                    ? variant === "admin" ? "text-red-600" : variant === "user" ? "text-slate-900" : "text-orange-600"
                    : "text-slate-400 group-hover:text-slate-600"
                )}>
                  {React.createElement(ICON_MAP[item.icon] || LayoutDashboard, { className: "w-5 h-5" })}
                </span>
                {!isCollapsed && (
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className={cn(
                    "ml-auto px-2 py-0.5 rounded-full text-[8px] font-black",
                    variant === "user" ? "bg-slate-100 text-slate-600" : "bg-orange-100 text-orange-600"
                  )}>{item.badge}</span>
                )}
              </LinkOrButton>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {variant === "organiser" && (isSuperAdmin || userRole === "SUPER_ADMIN") && (
            <button
              onClick={exitImpersonation}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all w-full text-left",
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? "System Control" : undefined}
            >
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">System Control</span>}
            </button>
          )}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all",
              isCollapsed && "justify-center px-0"
            )}
            title={isCollapsed ? "Public Site" : undefined}
          >
            <Eye className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">View Public Site</span>}
          </Link>
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center py-2 text-slate-300 hover:text-slate-500 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen flex flex-col",
        isCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"
      )}>
        {/* Desktop Top Header (Identity Bar) */}
        <div className="hidden lg:flex sticky top-10 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-5 items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Protocol Security Active</div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                Welcome back, <span className="text-orange-600">{currentUser?.name || "System Director"}</span>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className={cn(
                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                userRole === "SUPER_ADMIN" ? "bg-red-50 text-red-600 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100"
              )}>
                {userRole === "SUPER_ADMIN" ? "God Mode: Super Admin" : "Franchise Executive"}
              </div>
              <img 
                src={currentUser?.photoUrl || `https://ui-avatars.com/api/?name=${currentUser?.name || 'S'}&background=0f172a&color=fff`} 
                className="w-8 h-8 rounded-lg border border-slate-200 shadow-sm"
                alt="Profile"
              />
           </div>
        </div>

        {/* Mobile Topbar */}
        <div className="lg:hidden sticky top-10 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setIsMobileOpen(true)} className="p-2 bg-slate-100 rounded-xl">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-sm font-black italic uppercase tracking-tighter text-slate-900">
            {variant === "admin" ? "System Director" : (tenant?.name || "KabaddiHub")}
          </div>
          <button onClick={logout} className="p-2 bg-red-50 rounded-xl text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </main>

      <MatchSelectorModal 
        isOpen={isMatchSelectorOpen} 
        onClose={() => setIsMatchSelectorOpen(false)} 
      />
    </div>
  );
}
