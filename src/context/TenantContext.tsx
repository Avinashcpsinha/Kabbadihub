"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  createTenant: (name: string, city: string, color: string) => Tenant;
  updateTenant: (tenant: Tenant) => void;
  updateTenantStatus: (id: string, status: "ENABLED" | "DISABLED") => void;
  tenants: Tenant[];
  isSuperAdmin: boolean;
  setIsSuperAdmin: (status: boolean) => void;
  impersonateTenant: (id: string) => void;
  seedAllOrganisations: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// The Global 50 Player Pool used for seeding
const GLOBAL_PLAYER_SEED: Player[] = [
  { id: "p1", name: "Pawan Sehrawat", number: "17", role: "RAIDER", stats: { matches: 20, raidPoints: 120, tacklePoints: 5, superRaids: 10, superTackles: 0, superTens: 10, highFives: 0 } },
  { id: "p2", name: "Naveen Kumar", number: "10", role: "RAIDER", stats: { matches: 18, raidPoints: 115, tacklePoints: 2, superRaids: 8, superTackles: 0, superTens: 11, highFives: 0 } },
  { id: "p3", name: "Maninder Singh", number: "09", role: "RAIDER", stats: { matches: 19, raidPoints: 110, tacklePoints: 1, superRaids: 7, superTackles: 0, superTens: 9, highFives: 0 } },
  { id: "p4", name: "Pardeep Narwal", number: "01", role: "RAIDER", stats: { matches: 22, raidPoints: 130, tacklePoints: 0, superRaids: 15, superTackles: 0, superTens: 12, highFives: 0 } },
  { id: "p5", name: "Arjun Deshwal", number: "04", role: "RAIDER", stats: { matches: 17, raidPoints: 105, tacklePoints: 3, superRaids: 6, superTackles: 0, superTens: 8, highFives: 0 } },
  { id: "p6", name: "Fazel Atrachali", number: "07", role: "DEFENDER", stats: { matches: 22, raidPoints: 0, tacklePoints: 80, superRaids: 0, superTackles: 8, superTens: 0, highFives: 8 } },
  { id: "p7", name: "Mohammadreza Chiyaneh", number: "13", role: "DEFENDER", stats: { matches: 21, raidPoints: 5, tacklePoints: 85, superRaids: 0, superTackles: 10, superTens: 0, highFives: 9 } },
  { id: "p8", name: "Sagar Rathee", number: "05", role: "DEFENDER", stats: { matches: 20, raidPoints: 0, tacklePoints: 75, superRaids: 0, superTackles: 6, superTens: 0, highFives: 7 } },
  { id: "p9", name: "Surjeet Singh", number: "06", role: "DEFENDER", stats: { matches: 22, raidPoints: 0, tacklePoints: 78, superRaids: 0, superTackles: 5, superTens: 0, highFives: 6 } },
  { id: "p10", name: "Mohammad Nabibakhsh", number: "11", role: "ALL_ROUNDER", stats: { matches: 20, raidPoints: 60, tacklePoints: 45, superRaids: 2, superTackles: 5, superTens: 2, highFives: 3 } },
  { id: "p11", name: "Vijay Malik", number: "08", role: "ALL_ROUNDER", stats: { matches: 19, raidPoints: 75, tacklePoints: 35, superRaids: 3, superTackles: 2, superTens: 3, highFives: 1 } },
  { id: "p12", name: "Bharat Hooda", number: "21", role: "RAIDER", stats: { matches: 18, raidPoints: 85, tacklePoints: 8, superRaids: 4, superTackles: 0, superTens: 5, highFives: 0 } },
  { id: "p13", name: "Abhishek Singh", number: "12", role: "RAIDER", stats: { matches: 16, raidPoints: 78, tacklePoints: 4, superRaids: 3, superTackles: 0, superTens: 4, highFives: 0 } },
  { id: "p14", name: "Vikash Kandola", number: "15", role: "RAIDER", stats: { matches: 17, raidPoints: 70, tacklePoints: 2, superRaids: 2, superTackles: 0, superTens: 3, highFives: 0 } },
  { id: "p15", name: "Chandran Ranjit", number: "14", role: "RAIDER", stats: { matches: 15, raidPoints: 65, tacklePoints: 3, superRaids: 2, superTackles: 0, superTens: 2, highFives: 0 } },
  { id: "p16", name: "Meet Ibrahim", number: "22", role: "RAIDER", stats: { matches: 14, raidPoints: 60, tacklePoints: 1, superRaids: 1, superTackles: 0, superTens: 2, highFives: 0 } },
  { id: "p17", name: "Guman Singh", number: "25", role: "RAIDER", stats: { matches: 16, raidPoints: 72, tacklePoints: 5, superRaids: 3, superTackles: 0, superTens: 4, highFives: 0 } },
  { id: "p18", name: "Manjeet Sharma", number: "30", role: "RAIDER", stats: { matches: 13, raidPoints: 58, tacklePoints: 2, superRaids: 1, superTackles: 0, superTens: 1, highFives: 0 } },
  { id: "p19", name: "Sahil Singh", number: "03", role: "DEFENDER", stats: { matches: 18, raidPoints: 0, tacklePoints: 55, superRaids: 0, superTackles: 4, superTens: 0, highFives: 4 } },
  { id: "p20", name: "Jaideep Dahiya", number: "18", role: "DEFENDER", stats: { matches: 19, raidPoints: 0, tacklePoints: 62, superRaids: 0, superTackles: 5, superTens: 0, highFives: 5 } },
  { id: "p21", name: "Saurabh Nandal", number: "16", role: "DEFENDER", stats: { matches: 17, raidPoints: 0, tacklePoints: 58, superRaids: 0, superTackles: 4, superTens: 0, highFives: 4 } },
  { id: "p22", name: "Vishal Bhardwaj", number: "02", role: "DEFENDER", stats: { matches: 16, raidPoints: 2, tacklePoints: 52, superRaids: 0, superTackles: 3, superTens: 0, highFives: 3 } },
  { id: "p23", name: "Parvesh Bhainswal", number: "19", role: "DEFENDER", stats: { matches: 18, raidPoints: 0, tacklePoints: 54, superRaids: 0, superTackles: 4, superTens: 0, highFives: 4 } },
  { id: "p24", name: "Mahender Singh", number: "23", role: "DEFENDER", stats: { matches: 15, raidPoints: 0, tacklePoints: 48, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
  { id: "p25", name: "Rohit Gulia", number: "20", role: "ALL_ROUNDER", stats: { matches: 17, raidPoints: 55, tacklePoints: 25, superRaids: 1, superTackles: 1, superTens: 1, highFives: 1 } },
  { id: "p26", name: "Nitin Rawal", number: "24", role: "ALL_ROUNDER", stats: { matches: 16, raidPoints: 45, tacklePoints: 30, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
  { id: "p27", name: "Akash Shinde", number: "27", role: "RAIDER", stats: { matches: 14, raidPoints: 52, tacklePoints: 3, superRaids: 1, superTackles: 0, superTens: 1, highFives: 0 } },
  { id: "p28", name: "Ajinkya Pawar", number: "31", role: "RAIDER", stats: { matches: 12, raidPoints: 45, tacklePoints: 2, superRaids: 1, superTackles: 0, superTens: 1, highFives: 0 } },
  { id: "p29", name: "Aslam Inamdar", number: "32", role: "RAIDER", stats: { matches: 13, raidPoints: 48, tacklePoints: 10, superRaids: 1, superTackles: 1, superTens: 1, highFives: 0 } },
  { id: "p30", name: "Mohit Goyat", number: "33", role: "RAIDER", stats: { matches: 12, raidPoints: 42, tacklePoints: 15, superRaids: 0, superTackles: 2, superTens: 0, highFives: 0 } },
  { id: "p31", name: "Sachin Tanwar", number: "34", role: "RAIDER", stats: { matches: 14, raidPoints: 50, tacklePoints: 5, superRaids: 1, superTackles: 0, superTens: 1, highFives: 0 } },
  { id: "p32", name: "Siddharth Desai", number: "35", role: "RAIDER", stats: { matches: 11, raidPoints: 55, tacklePoints: 0, superRaids: 2, superTackles: 0, superTens: 2, highFives: 0 } },
  { id: "p33", name: "Monu Goyat", number: "36", role: "RAIDER", stats: { matches: 13, raidPoints: 38, tacklePoints: 5, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
  { id: "p34", name: "Surender Gill", number: "37", role: "RAIDER", stats: { matches: 14, raidPoints: 46, tacklePoints: 8, superRaids: 1, superTackles: 1, superTens: 1, highFives: 0 } },
  { id: "p35", name: "K. Prapanjan", number: "38", role: "RAIDER", stats: { matches: 12, raidPoints: 35, tacklePoints: 2, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
  { id: "p36", name: "Mohit Chhillar", number: "39", role: "DEFENDER", stats: { matches: 15, raidPoints: 0, tacklePoints: 40, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
  { id: "p37", name: "Ravinder Pahal", number: "40", role: "DEFENDER", stats: { matches: 16, raidPoints: 0, tacklePoints: 45, superRaids: 0, superTackles: 3, superTens: 0, highFives: 3 } },
  { id: "p38", name: "Girish Ernak", number: "41", role: "DEFENDER", stats: { matches: 14, raidPoints: 0, tacklePoints: 38, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
  { id: "p39", name: "Sandeep Dhull", number: "42", role: "DEFENDER", stats: { matches: 15, raidPoints: 0, tacklePoints: 42, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
  { id: "p40", name: "Rinku Narwal", number: "43", role: "DEFENDER", stats: { matches: 13, raidPoints: 0, tacklePoints: 35, superRaids: 0, superTackles: 1, superTens: 0, highFives: 1 } },
  { id: "p41", name: "Aman Sehrawat", number: "44", role: "DEFENDER", stats: { matches: 14, raidPoints: 0, tacklePoints: 37, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
  { id: "p42", name: "Nitesh Kumar", number: "45", role: "DEFENDER", stats: { matches: 16, raidPoints: 0, tacklePoints: 41, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
  { id: "p43", name: "Sumit Sangwan", number: "46", role: "DEFENDER", stats: { matches: 15, raidPoints: 0, tacklePoints: 39, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
  { id: "p44", name: "Deepak Niwas Hooda", number: "47", role: "ALL_ROUNDER", stats: { matches: 14, raidPoints: 40, tacklePoints: 20, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
  { id: "p45", name: "Sandeep Narwal", number: "48", role: "ALL_ROUNDER", stats: { matches: 16, raidPoints: 30, tacklePoints: 35, superRaids: 0, superTackles: 1, superTens: 0, highFives: 1 } },
  { id: "p46", name: "Prateek Dahiya", number: "49", role: "ALL_ROUNDER", stats: { matches: 12, raidPoints: 35, tacklePoints: 15, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
  { id: "p47", name: "Amirhossein Bastami", number: "50", role: "DEFENDER", stats: { matches: 13, raidPoints: 0, tacklePoints: 32, superRaids: 0, superTackles: 1, superTens: 0, highFives: 1 } },
  { id: "p48", name: "Nitin Dhankar", number: "51", role: "RAIDER", stats: { matches: 10, raidPoints: 30, tacklePoints: 1, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
  { id: "p49", name: "Surender Nada", number: "52", role: "DEFENDER", stats: { matches: 14, raidPoints: 0, tacklePoints: 38, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
  { id: "p50", name: "Ran Singh", number: "53", role: "ALL_ROUNDER", stats: { matches: 12, raidPoints: 20, tacklePoints: 25, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
];

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const defaultTenants: Tenant[] = [
    { id: "t1", name: "Pro Kabaddi Official", slug: "pkl", primaryColor: "#f97316", secondaryColor: "#0f172a", subscriptionTier: "ENTERPRISE", adminEmail: "admin@pkl.com", adminPassword: "admin123", status: "ENABLED" },
    { id: "t2", name: "Bengaluru Bulls Franchise", slug: "bengaluru-bulls", primaryColor: "#dc2626", secondaryColor: "#1e293b", subscriptionTier: "PRO", adminEmail: "admin@bulls.com", adminPassword: "password123", status: "ENABLED" },
    { id: "t3", name: "Dabang Delhi KC", slug: "dabang-delhi", primaryColor: "#2563eb", secondaryColor: "#1e293b", subscriptionTier: "PRO", adminEmail: "admin@delhi.com", adminPassword: "password123", status: "ENABLED" },
    { id: "t4", name: "Gujarat Giants", slug: "gujarat-giants", primaryColor: "#ea580c", secondaryColor: "#1e293b", subscriptionTier: "PRO", adminEmail: "admin@gujarat.com", adminPassword: "password123", status: "ENABLED" },
    { id: "t5", name: "Haryana Steelers", slug: "haryana-steelers", primaryColor: "#0891b2", secondaryColor: "#1e293b", subscriptionTier: "PRO", adminEmail: "admin@haryana.com", adminPassword: "password123", status: "ENABLED" },
    { id: "t6", name: "Jaipur Pink Panthers", slug: "jaipur-pink-panthers", primaryColor: "#db2777", secondaryColor: "#1e293b", subscriptionTier: "PRO", adminEmail: "admin@jaipur.com", adminPassword: "password123", status: "ENABLED" },
    { id: "t7", name: "Patna Pirates", slug: "patna-pirates", primaryColor: "#16a34a", secondaryColor: "#1e293b", subscriptionTier: "PRO", adminEmail: "admin@patna.com", adminPassword: "password123", status: "ENABLED" },
    { id: "t8", name: "Puneri Paltan", slug: "puneri-paltan", primaryColor: "#f59e0b", secondaryColor: "#1e293b", subscriptionTier: "PRO", adminEmail: "admin@puneri.com", adminPassword: "password123", status: "ENABLED" },
    { id: "t9", name: "Tamil Thalaivas", slug: "tamil-thalaivas", primaryColor: "#0369a1", secondaryColor: "#1e293b", subscriptionTier: "PRO", adminEmail: "admin@tamil.com", adminPassword: "password123", status: "ENABLED" },
    { id: "t10", name: "Telugu Titans", slug: "telugu-titans", primaryColor: "#e11d48", secondaryColor: "#1e293b", subscriptionTier: "PRO", adminEmail: "admin@telugu.com", adminPassword: "password123", status: "ENABLED" }
  ];

  const seedAllOrganisations = useCallback(() => {
    defaultTenants.forEach(t => {
      const teamKey = `kabaddihub_${t.id}_teams`;
      const playerKey = `kabaddihub_${t.id}_players`;
      
      const teamNames = ["Kings", "Warriors", "Titans", "Lions", "Superstars", "Strikers", "United", "Republic"];
      const generatedTeams: Team[] = [];
      const shuffledPlayers = [...GLOBAL_PLAYER_SEED].sort(() => 0.5 - Math.random());
      
      // Create 6 teams for each tenant
      for (let i = 0; i < 6; i++) {
        const teamPlayers = shuffledPlayers.slice(i * 7, (i + 1) * 7);
        const teamName = `${t.name.split(" ")[0]} ${teamNames[i]}`;
        const teamId = `tm_${t.id}_${i}`;

        generatedTeams.push({
          id: teamId,
          name: teamName,
          shortName: teamName.substring(0, 3).toUpperCase(),
          primaryColor: t.primaryColor,
          secondaryColor: t.secondaryColor,
          city: t.city || "Various",
          players: teamPlayers.map(p => ({ ...p, teamId, teamName }))
        });
      }

      localStorage.setItem(teamKey, JSON.stringify(generatedTeams));
      localStorage.setItem(playerKey, JSON.stringify(GLOBAL_PLAYER_SEED));
    });
    localStorage.setItem("kabaddihub_seed_completed_v2", "true");
    window.location.reload();
  }, []);

  useEffect(() => {
    const savedSuper = localStorage.getItem("kabaddihub_is_super");
    if (savedSuper === "true") setIsSuperAdmin(true);

    const savedAll = localStorage.getItem("kabaddihub_tenants");
    let currentAll = defaultTenants;
    
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

    // Auto-seed data on first load if missing
    if (!localStorage.getItem("kabaddihub_seed_completed_v2")) {
      seedAllOrganisations();
    }

    const savedCurrent = localStorage.getItem("kabaddihub_current_tenant");
    if (savedCurrent) {
      setTenant(JSON.parse(savedCurrent));
    }
    
    setIsLoading(false);
  }, [seedAllOrganisations]);

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
      status: "ENABLED",
      subscriptionTier: "FREE"
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
      window.location.href = "/admin";
    }
  }, [allTenants]);

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
      setIsSuperAdmin: (status: boolean) => {
        setIsSuperAdmin(status);
        localStorage.setItem("kabaddihub_is_super", status ? "true" : "false");
      },
      impersonateTenant,
      seedAllOrganisations
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
