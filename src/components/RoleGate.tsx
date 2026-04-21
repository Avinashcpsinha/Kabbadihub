"use client";

import React, { useEffect } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RoleGate({
  children,
  allowedRoles,
  redirectTo = "/user/dashboard"
}: RoleGateProps) {
  const { role, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!allowedRoles.includes(role)) {
      router.push(redirectTo);
    }
  }, [role, isAuthenticated, allowedRoles, router, redirectTo]);

  if (!isAuthenticated || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6 shadow-xl shadow-red-600/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Access Restricted</h1>
        <p className="text-sm font-medium text-slate-500 mb-8">You don't have the protocol clearance to access this hub.</p>
        <button 
          onClick={() => router.push(redirectTo)}
          className="ch-btn-primary px-8 py-4"
        >
          Return to Safe Zone
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
