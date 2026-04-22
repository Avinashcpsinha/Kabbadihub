"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PublicLayout from "@/components/PublicLayout";
import { 
  Trophy, 
  Zap, 
  Shield, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Filter,
  TrendingUp,
  Award,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Player, Team } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function LeaderboardPage() {
  const router = useRouter();
  const { role } = useAuth();
  const { tenant } = useTenant();
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState<"raiders" | "defenders">("raiders");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const activeTenant = tenant || JSON.parse(localStorage.getItem("kabaddihub_current_tenant") || "null") || { id: "global" };
    const tenantId = activeTenant.id;
    const playerKey = `kabaddihub_${tenantId}_players`;
    const savedPlayers = localStorage.getItem(playerKey);

    const initialPlayers: Player[] = [
      // Category A - Raiders
      { id: "p1", name: "Pawan Sehrawat", number: "17", teamId: "1", role: "RAIDER", stats: { matches: 20, raidPoints: 120, tacklePoints: 5, superRaids: 10, superTackles: 0, superTens: 10, highFives: 0 } },
      { id: "p2", name: "Naveen Kumar", number: "10", teamId: "2", role: "RAIDER", stats: { matches: 18, raidPoints: 115, tacklePoints: 2, superRaids: 8, superTackles: 0, superTens: 11, highFives: 0 } },
      { id: "p3", name: "Maninder Singh", number: "09", teamId: "3", role: "RAIDER", stats: { matches: 19, raidPoints: 110, tacklePoints: 1, superRaids: 7, superTackles: 0, superTens: 9, highFives: 0 } },
      { id: "p4", name: "Pardeep Narwal", number: "01", teamId: "4", role: "RAIDER", stats: { matches: 22, raidPoints: 130, tacklePoints: 0, superRaids: 15, superTackles: 0, superTens: 12, highFives: 0 } },
      { id: "p5", name: "Arjun Deshwal", number: "04", teamId: "5", role: "RAIDER", stats: { matches: 17, raidPoints: 105, tacklePoints: 3, superRaids: 6, superTackles: 0, superTens: 8, highFives: 0 } },
      
      // Category A - Defenders
      { id: "p6", name: "Fazel Atrachali", number: "07", teamId: "6", role: "DEFENDER", stats: { matches: 22, raidPoints: 0, tacklePoints: 80, superRaids: 0, superTackles: 8, superTens: 0, highFives: 8 } },
      { id: "p7", name: "Mohammadreza Chiyaneh", number: "13", teamId: "7", role: "DEFENDER", stats: { matches: 21, raidPoints: 5, tacklePoints: 85, superRaids: 0, superTackles: 10, superTens: 0, highFives: 9 } },
      { id: "p8", name: "Sagar Rathee", number: "05", teamId: "8", role: "DEFENDER", stats: { matches: 20, raidPoints: 0, tacklePoints: 75, superRaids: 0, superTackles: 6, superTens: 0, highFives: 7 } },
      { id: "p9", name: "Surjeet Singh", number: "06", teamId: "9", role: "DEFENDER", stats: { matches: 22, raidPoints: 0, tacklePoints: 78, superRaids: 0, superTackles: 5, superTens: 0, highFives: 6 } },
      
      // Category A - All Rounders
      { id: "p10", name: "Mohammad Nabibakhsh", number: "11", teamId: "10", role: "ALL_ROUNDER", stats: { matches: 20, raidPoints: 60, tacklePoints: 45, superRaids: 2, superTackles: 5, superTens: 2, highFives: 3 } },
      { id: "p11", name: "Vijay Malik", number: "08", teamId: "1", role: "ALL_ROUNDER", stats: { matches: 19, raidPoints: 75, tacklePoints: 35, superRaids: 3, superTackles: 2, superTens: 3, highFives: 1 } },
      
      // Category B - Raiders
      { id: "p12", name: "Bharat Hooda", number: "21", teamId: "2", role: "RAIDER", stats: { matches: 18, raidPoints: 85, tacklePoints: 8, superRaids: 4, superTackles: 0, superTens: 5, highFives: 0 } },
      { id: "p13", name: "Abhishek Singh", number: "12", teamId: "3", role: "RAIDER", stats: { matches: 16, raidPoints: 78, tacklePoints: 4, superRaids: 3, superTackles: 0, superTens: 4, highFives: 0 } },
      { id: "p14", name: "Vikash Kandola", number: "15", teamId: "4", role: "RAIDER", stats: { matches: 17, raidPoints: 70, tacklePoints: 2, superRaids: 2, superTackles: 0, superTens: 3, highFives: 0 } },
      { id: "p15", name: "Chandran Ranjit", number: "14", teamId: "5", role: "RAIDER", stats: { matches: 15, raidPoints: 65, tacklePoints: 3, superRaids: 2, superTackles: 0, superTens: 2, highFives: 0 } },
      { id: "p16", name: "Meet Ibrahim", number: "22", teamId: "6", role: "RAIDER", stats: { matches: 14, raidPoints: 60, tacklePoints: 1, superRaids: 1, superTackles: 0, superTens: 2, highFives: 0 } },
      { id: "p17", name: "Guman Singh", number: "25", teamId: "7", role: "RAIDER", stats: { matches: 16, raidPoints: 72, tacklePoints: 5, superRaids: 3, superTackles: 0, superTens: 4, highFives: 0 } },
      { id: "p18", name: "Manjeet Sharma", number: "30", teamId: "8", role: "RAIDER", stats: { matches: 13, raidPoints: 58, tacklePoints: 2, superRaids: 1, superTackles: 0, superTens: 1, highFives: 0 } },
      
      // Category B - Defenders
      { id: "p19", name: "Sahil Singh", number: "03", teamId: "9", role: "DEFENDER", stats: { matches: 18, raidPoints: 0, tacklePoints: 55, superRaids: 0, superTackles: 4, superTens: 0, highFives: 4 } },
      { id: "p20", name: "Jaideep Dahiya", number: "18", teamId: "10", role: "DEFENDER", stats: { matches: 19, raidPoints: 0, tacklePoints: 62, superRaids: 0, superTackles: 5, superTens: 0, highFives: 5 } },
      { id: "p21", name: "Saurabh Nandal", number: "16", teamId: "1", role: "DEFENDER", stats: { matches: 17, raidPoints: 0, tacklePoints: 58, superRaids: 0, superTackles: 4, superTens: 0, highFives: 4 } },
      { id: "p22", name: "Vishal Bhardwaj", number: "02", teamId: "2", role: "DEFENDER", stats: { matches: 16, raidPoints: 2, tacklePoints: 52, superRaids: 0, superTackles: 3, superTens: 0, highFives: 3 } },
      { id: "p23", name: "Parvesh Bhainswal", number: "19", teamId: "3", role: "DEFENDER", stats: { matches: 18, raidPoints: 0, tacklePoints: 54, superRaids: 0, superTackles: 4, superTens: 0, highFives: 4 } },
      { id: "p24", name: "Mahender Singh", number: "23", teamId: "4", role: "DEFENDER", stats: { matches: 15, raidPoints: 0, tacklePoints: 48, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
      
      // Category B - All Rounders
      { id: "p25", name: "Rohit Gulia", number: "20", teamId: "5", role: "ALL_ROUNDER", stats: { matches: 17, raidPoints: 55, tacklePoints: 25, superRaids: 1, superTackles: 1, superTens: 1, highFives: 1 } },
      { id: "p26", name: "Nitin Rawal", number: "24", teamId: "6", role: "ALL_ROUNDER", stats: { matches: 16, raidPoints: 45, tacklePoints: 30, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
      { id: "p27", name: "Akash Shinde", number: "27", teamId: "7", role: "RAIDER", stats: { matches: 14, raidPoints: 52, tacklePoints: 3, superRaids: 1, superTackles: 0, superTens: 1, highFives: 0 } },
      
      // Category C - Raiders
      { id: "p28", name: "Ajinkya Pawar", number: "31", teamId: "8", role: "RAIDER", stats: { matches: 12, raidPoints: 45, tacklePoints: 2, superRaids: 1, superTackles: 0, superTens: 1, highFives: 0 } },
      { id: "p29", name: "Aslam Inamdar", number: "32", teamId: "9", role: "RAIDER", stats: { matches: 13, raidPoints: 48, tacklePoints: 10, superRaids: 1, superTackles: 1, superTens: 1, highFives: 0 } },
      { id: "p30", name: "Mohit Goyat", number: "33", teamId: "10", role: "RAIDER", stats: { matches: 12, raidPoints: 42, tacklePoints: 15, superRaids: 0, superTackles: 2, superTens: 0, highFives: 0 } },
      { id: "p31", name: "Sachin Tanwar", number: "34", teamId: "1", role: "RAIDER", stats: { matches: 14, raidPoints: 50, tacklePoints: 5, superRaids: 1, superTackles: 0, superTens: 1, highFives: 0 } },
      { id: "p32", name: "Siddharth Desai", number: "35", teamId: "2", role: "RAIDER", stats: { matches: 11, raidPoints: 55, tacklePoints: 0, superRaids: 2, superTackles: 0, superTens: 2, highFives: 0 } },
      { id: "p33", name: "Monu Goyat", number: "36", teamId: "3", role: "RAIDER", stats: { matches: 13, raidPoints: 38, tacklePoints: 5, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
      { id: "p34", name: "Surender Gill", number: "37", teamId: "4", role: "RAIDER", stats: { matches: 14, raidPoints: 46, tacklePoints: 8, superRaids: 1, superTackles: 1, superTens: 1, highFives: 0 } },
      { id: "p35", name: "K. Prapanjan", number: "38", teamId: "5", role: "RAIDER", stats: { matches: 12, raidPoints: 35, tacklePoints: 2, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
      
      // Category C - Defenders
      { id: "p36", name: "Mohit Chhillar", number: "39", teamId: "6", role: "DEFENDER", stats: { matches: 15, raidPoints: 0, tacklePoints: 40, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
      { id: "p37", name: "Ravinder Pahal", number: "40", teamId: "7", role: "DEFENDER", stats: { matches: 16, raidPoints: 0, tacklePoints: 45, superRaids: 0, superTackles: 3, superTens: 0, highFives: 3 } },
      { id: "p38", name: "Girish Ernak", number: "41", teamId: "8", role: "DEFENDER", stats: { matches: 14, raidPoints: 0, tacklePoints: 38, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
      { id: "p39", name: "Sandeep Dhull", number: "42", teamId: "9", role: "DEFENDER", stats: { matches: 15, raidPoints: 0, tacklePoints: 42, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
      { id: "p40", name: "Rinku Narwal", number: "43", teamId: "10", role: "DEFENDER", stats: { matches: 13, raidPoints: 0, tacklePoints: 35, superRaids: 0, superTackles: 1, superTens: 0, highFives: 1 } },
      { id: "p41", name: "Aman Sehrawat", number: "44", teamId: "1", role: "DEFENDER", stats: { matches: 14, raidPoints: 0, tacklePoints: 37, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
      { id: "p42", name: "Nitesh Kumar", number: "45", teamId: "2", role: "DEFENDER", stats: { matches: 16, raidPoints: 0, tacklePoints: 41, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
      { id: "p43", name: "Sumit Sangwan", number: "46", teamId: "3", role: "DEFENDER", stats: { matches: 15, raidPoints: 0, tacklePoints: 39, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
      
      // Category C - All Rounders
      { id: "p44", name: "Deepak Niwas Hooda", number: "47", teamId: "4", role: "ALL_ROUNDER", stats: { matches: 14, raidPoints: 40, tacklePoints: 20, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
      { id: "p45", name: "Sandeep Narwal", number: "48", teamId: "5", role: "ALL_ROUNDER", stats: { matches: 16, raidPoints: 30, tacklePoints: 35, superRaids: 0, superTackles: 1, superTens: 0, highFives: 1 } },
      { id: "p46", name: "Prateek Dahiya", number: "49", teamId: "6", role: "ALL_ROUNDER", stats: { matches: 12, raidPoints: 35, tacklePoints: 15, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
      { id: "p47", name: "Amirhossein Bastami", number: "50", teamId: "7", role: "DEFENDER", stats: { matches: 13, raidPoints: 0, tacklePoints: 32, superRaids: 0, superTackles: 1, superTens: 0, highFives: 1 } },
      { id: "p48", name: "Nitin Dhankar", number: "51", teamId: "8", role: "RAIDER", stats: { matches: 10, raidPoints: 30, tacklePoints: 1, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
      { id: "p49", name: "Surender Nada", number: "52", teamId: "9", role: "DEFENDER", stats: { matches: 14, raidPoints: 0, tacklePoints: 38, superRaids: 0, superTackles: 2, superTens: 0, highFives: 2 } },
      { id: "p50", name: "Ran Singh", number: "53", teamId: "10", role: "ALL_ROUNDER", stats: { matches: 12, raidPoints: 20, tacklePoints: 25, superRaids: 0, superTackles: 0, superTens: 0, highFives: 0 } },
    ];

    if (savedPlayers) {
      const parsed = JSON.parse(savedPlayers);
      if (parsed.length < initialPlayers.length) {
        setPlayers(initialPlayers);
        localStorage.setItem(playerKey, JSON.stringify(initialPlayers));
      } else {
        setPlayers(parsed);
      }
    } else {
      setPlayers(initialPlayers);
      localStorage.setItem(playerKey, JSON.stringify(initialPlayers));
    }
  }, [tenant]);

  const filteredPlayers = players.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (activeTab === "raiders") return b.stats.raidPoints - a.stats.raidPoints;
    return b.stats.tacklePoints - a.stats.tacklePoints;
  });

  const Content = (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-40">
       {/* Top Navigation - Only show if Public */}
       {role === "PUBLIC" && (
         <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-10 z-[50]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <button 
                    onClick={() => router.back()} 
                    className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-orange-600 transition-all border-none cursor-pointer flex items-center justify-center"
                  >
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                     <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 leading-none block">{tenant?.name || "Athletic"} Registry</span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Official Roster & Benchmarks</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                     <button 
                       onClick={() => setActiveTab("raiders")}
                       className={cn(
                         "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                         activeTab === "raiders" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"
                       )}
                     >
                        Top Raiders
                     </button>
                     <button 
                       onClick={() => setActiveTab("defenders")}
                       className={cn(
                         "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                         activeTab === "defenders" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
                       )}
                     >
                        Top Defenders
                     </button>
                  </div>
               </div>
            </div>
         </nav>
       )}

       <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          
          {/* Podium Highlights */}
          <div className="grid md:grid-cols-3 gap-8 pb-12">
             {sortedPlayers.slice(0, 3).map((p, i) => (
                <div key={p.id} className={cn(
                  "bg-white ch-card p-10 flex flex-col items-center text-center relative overflow-hidden group transition-all hover:scale-[1.02]",
                  i === 0 ? "border-orange-600 ring-4 ring-orange-50 items-center justify-center py-14" : ""
                )}>
                   {i === 0 && (
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                         <Trophy className="w-24 h-24" />
                      </div>
                   )}
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                      {i === 0 ? "Championship King" : i === 1 ? "Premier Force" : "Elite Veteran"}
                   </div>
                   <div className="relative mb-8">
                      <div className={cn(
                        "w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-black italic",
                        i === 0 ? "bg-orange-600 text-white w-32 h-32" : "text-slate-400"
                      )}>
                         {p.name.charAt(0)}
                      </div>
                      <div className={cn(
                        "absolute -bottom-2 right-0 w-10 h-10 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg",
                        i === 0 ? "bg-orange-600" : "bg-slate-900"
                      )}>
                         <Zap className="w-4 h-4 fill-current" />
                      </div>
                   </div>
                   <div className="space-y-2 mb-8">
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 group-hover:text-orange-600 transition-colors">{p.name}</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Franchise Asset #{p.teamId}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center">
                         <div className="text-sm font-black italic text-slate-900 tabular-nums">{p.stats.raidPoints}</div>
                         <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Raids</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center">
                         <div className="text-sm font-black italic text-slate-900 tabular-nums">{p.stats.tacklePoints}</div>
                         <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Tackles</div>
                      </div>
                   </div>
                </div>
             ))}
          </div>

          {/* Full List */}
          <div className="bg-white ch-card overflow-hidden">
             <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-orange-600 rounded-xl text-white shadow-lg shadow-orange-600/20">
                      <TrendingUp className="w-5 h-5" />
                   </div>
                   <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900">Career Momentum</h3>
                </div>
                <div className="flex items-center gap-4">
                   <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex items-center gap-3">
                      <Search className="w-4 h-4 text-slate-400 ml-2" />
                      <input 
                        placeholder="Filter by Name..." 
                        className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none w-40" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-600/30 transition-all">
                      <Filter className="w-5 h-5" />
                   </button>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                         <th className="px-10 py-6">Athlete Profile</th>
                         <th className="px-10 py-6 text-center">Matches</th>
                         <th className="px-10 py-6 text-center">Raid Pts</th>
                         <th className="px-10 py-6 text-center">Tackle Pts</th>
                         <th className="px-10 py-6 text-right">League Rank</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {sortedPlayers.map((p, i) => (
                        <tr key={p.id} className="group hover:bg-slate-50/30 transition-all">
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                 <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black italic text-slate-400 relative">
                                    {p.name.charAt(0)}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                 </div>
                                 <div className="space-y-1">
                                    <div className="text-sm font-black uppercase italic text-slate-900 group-hover:text-orange-600 transition-colors leading-none">{p.name}</div>
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{p.role} • Franchise Asset</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-center text-sm font-black tabular-nums text-slate-900">{p.stats.matches}</td>
                           <td className="px-10 py-8 text-center text-sm font-black tabular-nums text-orange-600">{p.stats.raidPoints}</td>
                           <td className="px-10 py-8 text-center text-sm font-black tabular-nums text-blue-600">{p.stats.tacklePoints}</td>
                           <td className="px-10 py-8 text-right">
                              <span className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black tabular-nums shadow-lg shadow-slate-900/10">TOP {i + 1}</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {sortedPlayers.length === 0 && (
                <div className="py-24 text-center">
                  <Users className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <h3 className="text-xl font-black italic uppercase text-slate-900 mb-2">No Athletes Found</h3>
                  <p className="text-sm text-slate-400">Unable to find an athlete matching "{searchQuery}"</p>
                </div>
              )}
          </div>
       </main>
     </div>
  );

  if (role === "PUBLIC") return <PublicLayout>{Content}</PublicLayout>;
  return (
    <DashboardLayout variant="organiser">
       {Content}
    </DashboardLayout>
  );
}
