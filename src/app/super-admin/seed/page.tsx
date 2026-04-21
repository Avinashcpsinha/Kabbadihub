"use client";

import React, { useState } from "react";
import { 
  Database, 
  Zap, 
  Users, 
  Trophy, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2,
  Trash2,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SeedDataPage() {
  const [status, setStatus] = useState<"IDLE" | "SEEDING" | "COMPLETED">("IDLE");
  const [log, setLog] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (msg: string) => setLog(prev => [msg, ...prev]);

  const seedEverything = async () => {
    setStatus("SEEDING");
    setLog([]);
    addLog("Initializing High-Fidelity Data Matrix...");

    // 1. Seed 10 Organizations (Tenants)
    const tenants = [
      { id: "t1", name: "Pro Kabaddi Official", slug: "pkl", primaryColor: "#f97316", secondaryColor: "#0f172a", status: "ENABLED", subscriptionTier: "ENTERPRISE", adminEmail: "admin@pkl.com", adminPassword: "admin123" },
      { id: "t2", name: "Maharashtra Kabbadi League", slug: "mkl", primaryColor: "#2563eb", secondaryColor: "#1e293b", status: "ENABLED", subscriptionTier: "PRO", adminEmail: "admin@mkl.com", adminPassword: "admin123" },
      { id: "t3", name: "Haryana Steelers Hub", slug: "hsh", primaryColor: "#dc2626", secondaryColor: "#000000", status: "ENABLED", subscriptionTier: "PRO", adminEmail: "admin@hsh.com", adminPassword: "admin123" },
      { id: "t4", name: "Tamil Thalaivas Org", slug: "tto", primaryColor: "#facc15", secondaryColor: "#1e3a8a", status: "ENABLED", subscriptionTier: "FREE", adminEmail: "admin@tto.com", adminPassword: "admin123" },
      { id: "t5", name: "Bengal Warriors Arena", slug: "bwa", primaryColor: "#0891b2", secondaryColor: "#0f172a", status: "ENABLED", subscriptionTier: "ENTERPRISE", adminEmail: "admin@bwa.com", adminPassword: "admin123" },
      { id: "t6", name: "Jaipur Pink League", slug: "jpl", primaryColor: "#db2777", secondaryColor: "#1e293b", status: "ENABLED", subscriptionTier: "PRO", adminEmail: "admin@jpl.com", adminPassword: "admin123" },
      { id: "t7", name: "Gujarat Giants Academy", slug: "gga", primaryColor: "#ea580c", secondaryColor: "#000000", status: "ENABLED", subscriptionTier: "FREE", adminEmail: "admin@gga.com", adminPassword: "admin123" },
      { id: "t8", name: "Telugu Titans Force", slug: "ttf", primaryColor: "#7c3aed", secondaryColor: "#1e1b4b", status: "ENABLED", subscriptionTier: "PRO", adminEmail: "admin@ttf.com", adminPassword: "admin123" },
      { id: "t9", name: "Patna Pirates Home", slug: "pph", primaryColor: "#16a34a", secondaryColor: "#064e3b", status: "ENABLED", subscriptionTier: "ENTERPRISE", adminEmail: "admin@pph.com", adminPassword: "admin123" },
      { id: "t10", name: "UP Yoddhas Collective", slug: "upy", primaryColor: "#4f46e5", secondaryColor: "#1e1b4b", status: "ENABLED", subscriptionTier: "PRO", adminEmail: "admin@upy.com", adminPassword: "admin123" }
    ];
    localStorage.setItem("kabaddihub_tenants", JSON.stringify(tenants));
    addLog("✅ 10 Organizations provisioned.");

    // 2. Generate 400 Players
    const roles = ["RAIDER", "DEFENDER", "ALL_ROUNDER"];
    const cities = ["Mumbai", "Delhi", "Chennai", "Pune", "Haryana", "Jaipur", "Kolkata", "Patna", "Bangalore", "Hyderabad"];
    const firstNames = ["Pawan", "Naveen", "Pardeep", "Siddharth", "Manjeet", "Rahul", "Vikas", "Sachin", "Monu", "Rohit", "Fazel", "Mohammad", "Abit", "Deepak", "Sandeeep", "Surender"];
    const lastNames = ["Sehrawat", "Kumar", "Narwal", "Desai", "Dahiya", "Chaudhari", "Kandola", "Tanwar", "Goyat", "Gulia", "Atrachali", "Nabibakhsh", "Nandal", "Niwas", "Dhull", "Nada"];

    const players: any[] = [];
    for (let i = 1; i <= 400; i++) {
      players.push({
        id: `p${i}`,
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        number: String(Math.floor(Math.random() * 99) + 1),
        role: roles[Math.floor(Math.random() * roles.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        category: ["A", "B", "C"][Math.floor(Math.random() * 3)],
        basePrice: (Math.floor(Math.random() * 10) + 5) * 100000,
        status: "UPCOMING",
        stats: {
          raidPoints: Math.floor(Math.random() * 500),
          tacklePoints: Math.floor(Math.random() * 300),
          matches: Math.floor(Math.random() * 100),
          superTens: Math.floor(Math.random() * 20),
          highFives: Math.floor(Math.random() * 15)
        }
      });
    }

    // Assign players to organizations (40 players per org for depth)
    tenants.forEach((t, idx) => {
      const orgPlayers = players.slice(idx * 40, (idx + 1) * 40);
      localStorage.setItem(`kabaddihub_${t.id}_players`, JSON.stringify(orgPlayers));
      
      // Seed 10 Teams per org
      const orgTeams = [];
      for(let j=1; j<=10; j++) {
        orgTeams.push({
          id: `${t.id}_team${j}`,
          name: `${t.name.split(' ')[0]} ${cities[j-1]} Titans`,
          shortName: `${t.slug.toUpperCase()}${j}`,
          city: cities[j-1],
          primaryColor: t.primaryColor,
          secondaryColor: t.secondaryColor,
          players: orgPlayers.slice((j-1)*4, j*4) // 4 players per team for demo
        });
      }
      localStorage.setItem(`kabaddihub_${t.id}_teams`, JSON.stringify(orgTeams));

      // Seed 10 Tournaments per org
      const tournaments = [];
      for(let k=1; k<=10; k++) {
        tournaments.push({
          id: `${t.id}_tour${k}`,
          name: `${t.name} Season ${k}`,
          status: k === 10 ? "LIVE" : "COMPLETED",
          teams: orgTeams.map(st => st.id)
        });
      }
      localStorage.setItem(`kabaddihub_${t.id}_tournaments`, JSON.stringify(tournaments));

      // Seed Auctions
      localStorage.setItem(`kabaddihub_${t.id}_auction_players`, JSON.stringify(orgPlayers));
    });

    localStorage.setItem("kabaddihub_global_players", JSON.stringify(players));
    addLog("✅ 400 Players distributed across 10 regions.");
    addLog("✅ 100 Tournaments (10 per org) initialized.");
    addLog("✅ Auction Pools generated for all Nodes.");
    
    setStatus("COMPLETED");
    addLog("✨ System Seed Successful. Redirecting...");
    setTimeout(() => router.push("/super-admin"), 2000);
  };

  const clearData = () => {
    localStorage.clear();
    addLog("🗑️ System Wiped Clean.");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-600/30 overflow-hidden relative">
       {/* Background Aesthetics */}
       <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-orange-600/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
       
       <main className="max-w-4xl mx-auto p-12 lg:p-24 relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="w-20 h-20 bg-orange-600 rounded-[2rem] flex items-center justify-center mb-12 shadow-2xl shadow-orange-600/20">
             <Database className="w-10 h-10" />
          </div>

          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-center mb-6">Matrix Seeding Console</h1>
          <p className="text-slate-400 text-center mb-16 max-w-lg leading-relaxed italic">
             Provisioning a high-density dataset for platform stress testing: 10 Tenants, 400 Elite Athletes, 100 Tournaments, and High-Fidelity Auction Pools.
          </p>

          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
             <button 
               onClick={seedEverything}
               disabled={status === "SEEDING"}
               className="ch-btn-primary py-6 flex items-center justify-center gap-4 bg-slate-900 border border-slate-800 hover:bg-black group transition-all"
             >
                {status === "SEEDING" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-orange-600 fill-current" />}
                {status === "SEEDING" ? "Seeding..." : "Inject Data"}
             </button>
             <button 
               onClick={clearData}
               className="bg-white/5 border border-white/5 py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-3"
             >
                <Trash2 className="w-4 h-4" /> Reset Portal
             </button>
          </div>

          {log.length > 0 && (
            <div className="w-full mt-24 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 font-mono text-xs overflow-hidden">
               <div className="flex items-center gap-3 mb-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <ShieldAlert className="w-4 h-4" /> Operational Log
               </div>
               <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                  {log.map((l, i) => (
                    <div key={i} className="flex items-start gap-4">
                       <span className="text-slate-800 shrink-0">[{474 - i}]</span>
                       <span className={cn(l.startsWith('✅') ? "text-emerald-500" : "text-slate-300")}>{l}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          <Link href="/super-admin" className="mt-12 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-3">
             <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
       </main>

       <footer className="absolute bottom-12 left-12 text-[8px] font-black uppercase tracking-[0.4em] text-slate-700">
          Data Genesis Module • v4.0.1
       </footer>
    </div>
  );
}
