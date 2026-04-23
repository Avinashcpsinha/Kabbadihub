"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Player, Team } from "@/types";

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
  createTenant: (name: string, city: string, color: string) => Promise<Tenant | null>;
  updateTenant: (tenant: Tenant) => Promise<void>;
  updateTenantStatus: (id: string, status: "ENABLED" | "DISABLED") => Promise<void>;
  tenants: Tenant[];
  isSuperAdmin: boolean;
  setIsSuperAdmin: (status: boolean) => void;
  impersonateTenant: (id: string) => void;
  deleteTenant: (id: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
  exitImpersonation: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching tenants:", error);
      setIsLoading(false);
      return;
    }

    if (tenants) {
      const mappedTenants: Tenant[] = tenants.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        logoUrl: t.logo_url,
        bannerUrl: t.banner_url,
        primaryColor: t.primary_color,
        secondaryColor: t.secondary_color,
        subscriptionTier: t.subscription_tier as any,
        adminEmail: t.admin_email,
        adminPassword: t.admin_password,
        city: t.city,
        phone: t.phone,
        email: t.email,
        status: t.status as any,
      }));
      setAllTenants(mappedTenants);
      
      // Sync current tenant from localStorage if it exists
      if (typeof window !== "undefined") {
        const savedCurrent = localStorage.getItem("kabaddihub_current_tenant");
        if (savedCurrent) {
          const parsed = JSON.parse(savedCurrent);
          const found = mappedTenants.find(t => t.id === parsed.id);
          if (found) setTenant(found);
        }
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSuper = localStorage.getItem("kabaddihub_is_super");
      if (savedSuper === "true") setIsSuperAdmin(true);
    }
    fetchTenants();
  }, [fetchTenants]);

  const updateTenantState = useCallback((newTenant: Tenant | null) => {
    setTenant(newTenant);
    if (newTenant) {
      localStorage.setItem("kabaddihub_current_tenant", JSON.stringify(newTenant));
    } else {
      localStorage.removeItem("kabaddihub_current_tenant");
    }
  }, []);

  const createTenant = async (name: string, city: string, color: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const { data, error } = await supabase
      .from('tenants')
      .insert([{
        name,
        city,
        slug,
        primary_color: color,
        secondary_color: "#0f172a",
        status: "ENABLED",
        subscription_tier: "FREE"
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating tenant:", error);
      return null;
    }

    await fetchTenants();
    return data as any;
  };

  const updateTenant = async (newTenant: Tenant) => {
    const { error } = await supabase
      .from('tenants')
      .update({
        name: newTenant.name,
        slug: newTenant.slug,
        logo_url: newTenant.logoUrl,
        banner_url: newTenant.bannerUrl,
        primary_color: newTenant.primaryColor,
        secondary_color: newTenant.secondaryColor,
        subscription_tier: newTenant.subscriptionTier,
        city: newTenant.city,
        phone: newTenant.phone,
        email: newTenant.email,
        status: newTenant.status,
      })
      .eq('id', newTenant.id);

    if (error) {
      console.error("Error updating tenant:", error);
      return;
    }

    await fetchTenants();
  };

  const updateTenantStatus = async (id: string, status: "ENABLED" | "DISABLED") => {
    const { error } = await supabase
      .from('tenants')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error("Error updating tenant status:", error);
      return;
    }

    await fetchTenants();
    if (tenant?.id === id && status === "DISABLED") {
      updateTenantState(null);
    }
  };

  const router = useRouter();

  const impersonateTenant = (id: string) => {
    const target = allTenants.find(t => t.id === id);
    if (target) {
      updateTenantState(target);
      router.push("/admin");
    }
  };

  const exitImpersonation = () => {
    updateTenantState(null);
    router.push("/super-admin");
  };

  const deleteTenant = async (id: string) => {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting tenant:", error);
      return;
    }

    await fetchTenants();
    if (tenant?.id === id) {
      updateTenantState(null);
    }
  };

  return (
    <TenantContext.Provider value={{ 
      tenant, 
      setTenant: updateTenantState, 
      isLoading, 
      createTenant,
      updateTenant,
      updateTenantStatus,
      tenants: allTenants,
      isSuperAdmin,
      setIsSuperAdmin: (status: boolean) => {
        setIsSuperAdmin(status);
        if (typeof window !== "undefined") {
          localStorage.setItem("kabaddihub_is_super", status ? "true" : "false");
        }
      },
      impersonateTenant,
      deleteTenant,
      refreshTenants: fetchTenants,
      exitImpersonation
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) throw new Error("useTenant must be used within a TenantProvider");
  return context;
}
