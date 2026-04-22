"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  subscriptionTier: "FREE" | "PRO" | "ENTERPRISE";
  adminEmail?: string;
  adminPassword?: string;
  city?: string;
  phone?: string;
  email?: string;
  status: "ENABLED" | "DISABLED";
}

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  createTenant: (name: string, city: string, color: string) => Tenant;
  updateTenant: (tenant: Tenant) => void;
  updateTenantStatus: (id: string, status: "ENABLED" | "DISABLED") => void;
  tenants: Tenant[];
  isSuperAdmin: boolean;
  setIsSuperAdmin: (status: boolean) => void;
  impersonateTenant: (id: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const defaultTenants: Tenant[] = [
    {
      id: "t1",
      name: "Pro Kabaddi Official",
      slug: "pkl",
      primaryColor: "#f97316",
      secondaryColor: "#0f172a",
      subscriptionTier: "ENTERPRISE",
      adminEmail: "admin@pkl.com",
      adminPassword: "admin123",
      status: "ENABLED"
    },
    {
      id: "t2",
      name: "Bengaluru Bulls Franchise",
      slug: "bengaluru-bulls",
      primaryColor: "#dc2626",
      secondaryColor: "#1e293b",
      subscriptionTier: "PRO",
      adminEmail: "admin@bulls.com",
      adminPassword: "password123",
      status: "ENABLED"
    },
    {
      id: "t3",
      name: "Dabang Delhi KC",
      slug: "dabang-delhi",
      primaryColor: "#2563eb",
      secondaryColor: "#1e293b",
      subscriptionTier: "PRO",
      adminEmail: "admin@delhi.com",
      adminPassword: "password123",
      status: "ENABLED"
    },
    {
      id: "t4",
      name: "Gujarat Giants",
      slug: "gujarat-giants",
      primaryColor: "#ea580c",
      secondaryColor: "#1e293b",
      subscriptionTier: "PRO",
      adminEmail: "admin@gujarat.com",
      adminPassword: "password123",
      status: "ENABLED"
    },
    {
      id: "t5",
      name: "Haryana Steelers",
      slug: "haryana-steelers",
      primaryColor: "#0891b2",
      secondaryColor: "#1e293b",
      subscriptionTier: "PRO",
      adminEmail: "admin@haryana.com",
      adminPassword: "password123",
      status: "ENABLED"
    },
    {
      id: "t6",
      name: "Jaipur Pink Panthers",
      slug: "jaipur-pink-panthers",
      primaryColor: "#db2777",
      secondaryColor: "#1e293b",
      subscriptionTier: "PRO",
      adminEmail: "admin@jaipur.com",
      adminPassword: "password123",
      status: "ENABLED"
    },
    {
      id: "t7",
      name: "Patna Pirates",
      slug: "patna-pirates",
      primaryColor: "#16a34a",
      secondaryColor: "#1e293b",
      subscriptionTier: "PRO",
      adminEmail: "admin@patna.com",
      adminPassword: "password123",
      status: "ENABLED"
    },
    {
      id: "t8",
      name: "Puneri Paltan",
      slug: "puneri-paltan",
      primaryColor: "#f59e0b",
      secondaryColor: "#1e293b",
      subscriptionTier: "PRO",
      adminEmail: "admin@puneri.com",
      adminPassword: "password123",
      status: "ENABLED"
    },
    {
      id: "t9",
      name: "Tamil Thalaivas",
      slug: "tamil-thalaivas",
      primaryColor: "#0369a1",
      secondaryColor: "#1e293b",
      subscriptionTier: "PRO",
      adminEmail: "admin@tamil.com",
      adminPassword: "password123",
      status: "ENABLED"
    },
    {
      id: "t10",
      name: "Telugu Titans",
      slug: "telugu-titans",
      primaryColor: "#e11d48",
      secondaryColor: "#1e293b",
      subscriptionTier: "PRO",
      adminEmail: "admin@telugu.com",
      adminPassword: "password123",
      status: "ENABLED"
    }
  ];

  useEffect(() => {
    // Load Super Admin state
    const savedSuper = localStorage.getItem("kabaddihub_is_super");
    if (savedSuper === "true") setIsSuperAdmin(true);

    const savedAll = localStorage.getItem("kabaddihub_tenants");
    let currentAll = defaultTenants;
    
    // Force update if the tenants list is old/incomplete (e.g. less than 10 tenants)
    if (savedAll) {
      const parsed = JSON.parse(savedAll);
      if (parsed.length < defaultTenants.length) {
        currentAll = defaultTenants;
        localStorage.setItem("kabaddihub_tenants", JSON.stringify(defaultTenants));
      } else {
        currentAll = parsed;
      }
    } else {
      localStorage.setItem("kabaddihub_tenants", JSON.stringify(defaultTenants));
    }
    setAllTenants(currentAll);

    const savedCurrent = localStorage.getItem("kabaddihub_current_tenant");
    if (savedCurrent) {
      setTenant(JSON.parse(savedCurrent));
    }
    
    setIsLoading(false);
  }, []);

  const updateTenant = useCallback((newTenant: Tenant | null) => {
    setTenant(newTenant);
    if (newTenant) {
      localStorage.setItem("kabaddihub_current_tenant", JSON.stringify(newTenant));
    } else {
      localStorage.removeItem("kabaddihub_current_tenant");
    }
  }, []);

  const createTenant = useCallback((name: string, city: string, color: string) => {
    const newTenant: Tenant = {
      id: `tenant_${Date.now()}`,
      name: name,
      city: city,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      primaryColor: color,
      secondaryColor: "#0f172a",
      subscriptionTier: "FREE",
      status: "ENABLED"
    };

    const updated = [...allTenants, newTenant];
    setAllTenants(updated);
    localStorage.setItem("kabaddihub_tenants", JSON.stringify(updated));
    return newTenant;
  }, [allTenants]);

  const updateTenantStatus = useCallback((id: string, status: "ENABLED" | "DISABLED") => {
    const updated = allTenants.map(t => t.id === id ? { ...t, status } : t);
    setAllTenants(updated);
    localStorage.setItem("kabaddihub_tenants", JSON.stringify(updated));
    
    if (tenant?.id === id && status === "DISABLED") {
      setTenant(null);
      localStorage.removeItem("kabaddihub_current_tenant");
    }
  }, [allTenants, tenant]);

  const impersonateTenant = useCallback((id: string) => {
    const target = allTenants.find(t => t.id === id);
    if (target) {
      setTenant(target);
      localStorage.setItem("kabaddihub_current_tenant", JSON.stringify(target));
      window.location.href = "/admin"; // Redirect to admin dashboard
    }
  }, [allTenants]);

  const handleSetSuperAdmin = (val: boolean) => {
    setIsSuperAdmin(val);
    localStorage.setItem("kabaddihub_is_super", val ? "true" : "false");
  };

  return (
    <TenantContext.Provider value={{ 
      tenant, 
      setTenant: updateTenant, 
      isLoading, 
      createTenant,
      updateTenant,
      updateTenantStatus,
      tenants: allTenants,
      isSuperAdmin,
      setIsSuperAdmin: handleSetSuperAdmin,
      impersonateTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
