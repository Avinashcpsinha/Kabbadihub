"use client";

import React from "react";
import { ChevronRight, Home, LayoutDashboard, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTenant } from "@/context/TenantContext";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { tenant, isSuperAdmin } = useTenant();

  // Don't show on landing page
  if (pathname === "/" || pathname === "/login" || pathname === "/register") return null;

  const paths = pathname.split("/").filter(p => p);
  
  const getDisplayName = (path: string) => {
    const map: Record<string, string> = {
      "admin": "Dashboard",
      "super-admin": "Director Console",
      "teams": "Franchise Registry",
      "players": "Athlete Pool",
      "tournaments": "Match Hub",
      "scoring": "Live Console",
      "auction": "Auction Center",
      "bidding": "Bidding Terminal",
      "presentation": "Stage Mode",
      "overlay": "Broadcast Hub",
      "seed": "Genesis Console",
      "user": "Fan Profile",
      "profile": "Settings & Identity",
      "dashboard": "Arena Overview",
      "matches": "Match Center",
      "results": "Season Scorecards",
      "analytics": "Performance Data",
      "announcements": "Broadcasts",
      "audit": "System Logs",
      "settings": "Configuration"
    };
    return map[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="bg-slate-900 text-white px-6 py-2.5 sticky top-0 z-[100] shadow-xl h-10 flex items-center">
       <div className="max-w-7xl mx-auto w-full flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em]">
          <Link href="/" className="text-slate-400 hover:text-orange-600 transition-colors flex items-center gap-1.5">
             <Home className="w-3 h-3" />
          </Link>
          
          <ChevronRight className="w-3 h-3 text-slate-200" />

          {isSuperAdmin && pathname.startsWith('/super-admin') && (
            <>
               <Link href="/super-admin" className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3" /> System
               </Link>
               <ChevronRight className="w-3 h-3 text-slate-200" />
            </>
          )}

          {tenant && pathname.startsWith('/admin') && (
            <>
               <Link href="/admin" className="text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-3 h-3" /> {tenant.name}
               </Link>
               <ChevronRight className="w-3 h-3 text-slate-200" />
            </>
          )}

          {paths.map((p, i) => {
            const href = `/${paths.slice(0, i + 1).join("/")}`;
            const isLast = i === paths.length - 1;
            
            // Skip admin/super-admin if we already showed them above
            if (p === "admin" || p === "super-admin") return null;

            return (
              <React.Fragment key={href}>
                <Link 
                  href={href}
                  className={cn(
                    isLast ? "text-orange-500 pointer-events-none shadow-sm" : "text-slate-400 hover:text-orange-400"
                  )}
                >
                  {getDisplayName(p)}
                </Link>
                {!isLast && <ChevronRight className="w-3 h-3 text-slate-200 font-normal" />}
              </React.Fragment>
            );
          })}
       </div>
    </nav>
  );
}
