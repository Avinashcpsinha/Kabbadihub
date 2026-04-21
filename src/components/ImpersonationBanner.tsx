"use client";

import React from "react";
import { ShieldAlert, ArrowLeft, X } from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

export default function ImpersonationBanner() {
  const { tenant, setTenant, isSuperAdmin } = useTenant();
  const router = useRouter();

  if (!isSuperAdmin || !tenant) return null;

  const stopImpersonation = () => {
    setTenant(null);
    router.push("/super-admin");
  };

  return (
    <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between sticky top-0 z-[100] shadow-2xl">
       <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 animate-pulse">
             <ShieldAlert className="w-3.5 h-3.5" /> Impersonation Active
          </div>
          <p className="text-xs font-medium italic opacity-90">
             Viewing as: <span className="font-black uppercase tracking-tight">{tenant.name}</span>
          </p>
       </div>
       <button 
         onClick={stopImpersonation}
         className="flex items-center gap-2 bg-white text-red-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg"
       >
          <X className="w-3.5 h-3.5" /> Stop Impersonation
       </button>
    </div>
  );
}
