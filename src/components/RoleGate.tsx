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
  const { role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Master bypass for Super Admins
    if (role === "SUPER_ADMIN") return;

    if (!allowedRoles.includes(role)) {
      router.push(redirectTo);
    }
  }, [role, isAuthenticated, isLoading, allowedRoles, router, redirectTo]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authenticating Protocol...</p>
      </div>
    );
  }

  // Security Verification Screen
  // Only show if loading is absolutely finished and role is definitely NOT allowed
  const isRestricted = !isLoading && isAuthenticated && role !== "SUPER_ADMIN" && !allowedRoles.includes(role);

  if (isRestricted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Access Restricted</h1>
        <p className="text-sm font-medium text-slate-500 mb-8 max-w-xs text-center">You don't have the protocol clearance to access this hub.</p>
        <button 
          onClick={() => router.push(redirectTo)}
          className="ch-btn-primary px-10 py-4"
        >
          Return to Safe Zone
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
