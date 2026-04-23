"use client";

import React, { useState, Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Zap, MessageSquare, UserPlus, Target, Clock, 
  MapPin, Swords, ChevronRight, Search, Users, 
  Award, ArrowLeft, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

function ChallengesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSpectator = searchParams.get("view") === "spectator";
  const { role, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");

  const openChallenges = [
    {
      id: "c1",
      challenger: "RAHUL 'THE TANK'",
      team: "Bengaluru Panthers",
      role: "Raider",
      distance: "2.4 km away",
      message: "Looking for a high-intensity 7v7 practice session this weekend. Any takers?",
      sport: "Kabaddi",
      intensity: "High"
    },
    {
      id: "c2",
      challenger: "VIKRAM J.",
      team: "Independent",
      role: "Defender",
      distance: "0.8 km away",
      message: "Need 2 more defenders for a friendly match at Shivaji Stadium, Mat 1.",
      sport: "Kabaddi",
      intensity: "Medium"
    },
    {
      id: "c3",
      challenger: "DABANG JUNIORS",
      team: "Dabang Delhi Acad.",
      role: "Team Challenge",
      distance: "5.2 km away",
      message: "Official club challenge. Looking for 3 matches back-to-back.",
      sport: "Kabaddi",
      intensity: "Pro"
    }
  ];

  const Content = (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-20 space-y-12 relative bg-transparent">
       <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 blur-[120px] rounded-full -z-10" />

       {(role === "PUBLIC" || isSpectator) && (
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
             <button 
               onClick={() => router.back()} 
               className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center shadow-sm"
             >
               <ArrowLeft className="w-5 h-5 text-slate-400" />
             </button>
             <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 mb-2">
                 <Swords className="w-3.5 h-3.5 text-orange-600" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">The Arena Matchmaking</span>
               </div>
               <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Global Challenges</h1>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button className="ch-btn-primary px-8 py-4 shadow-xl shadow-orange-600/20 flex items-center gap-2">
                 <Plus className="w-5 h-5" /> Post a Challenge
              </button>
           </div>
         </header>
       )}

        <div className="flex flex-wrap gap-4">
           {[
             { label: "Players Online", val: "1,204", icon: Users },
             { label: "Active Challenges", val: "48", icon: Target },
             { label: "Matches Today", val: "12", icon: Clock },
             { label: "Verified Clubs", val: "8", icon: Award }
           ].map((s, i) => (
             <div key={i} className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
               <div className="text-orange-600"><s.icon className="w-4 h-4" /></div>
               <span className="text-sm font-black italic text-slate-900 tabular-nums">{s.val}</span>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
             </div>
           ))}
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 space-y-6">
              <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 w-fit shadow-sm mb-4">
                {["discover", "nearby", "my_requests"].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab.replace("_", " ")}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {openChallenges.map((c, i) => (
                  <motion.div 
                    key={c.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all"
                  >
                    <div className="absolute top-0 right-0 p-8">
                       <div className={cn(
                         "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border italic",
                         c.intensity === "Pro" ? "bg-red-50 text-red-600 border-red-100" : 
                         c.intensity === "High" ? "bg-orange-50 text-orange-600 border-orange-100" :
                         "bg-emerald-50 text-emerald-600 border-emerald-100"
                       )}>
                          {c.intensity} Intensity
                       </div>
                    </div>

                    <div className="flex gap-6 items-start mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-2xl font-black italic text-white shadow-lg shadow-orange-600/20">
                        {c.challenger.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-1">{c.challenger}</h3>
                        <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                           <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-orange-500" /> {c.team}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-blue-500" /> {c.role}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-10 max-w-xl italic font-medium">
                      "{c.message}"
                    </p>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t border-slate-50">
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <MapPin className="w-4 h-4 text-orange-600" />
                             {c.distance}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <Clock className="w-4 h-4 text-slate-300" />
                             Expires in 4h
                          </div>
                       </div>
                       <div className="flex gap-3">
                          <button className="px-6 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all border border-slate-100 flex items-center gap-2">
                             <MessageSquare className="w-4 h-4" /> Message
                          </button>
                          <button className="px-8 py-3 ch-btn-primary shadow-lg shadow-orange-600/20 group/btn flex items-center gap-2">
                             Accept Challenge <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/5 blur-[40px] rounded-full" />
                 <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center text-4xl font-black italic text-white shadow-2xl mb-6">
                      {currentUser?.avatarInitial || "A"}
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-1">
                      {currentUser?.name || "GUEST ATHLETE"}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-8 px-4 py-1.5 bg-orange-50 rounded-full border border-orange-100">
                      {currentUser?.position || "Arena Scout"}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full mb-8">
                       <div className="text-center">
                          <div className="text-2xl font-black italic text-slate-900 tabular-nums">42</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Won</div>
                       </div>
                       <div className="text-center">
                          <div className="text-2xl font-black italic text-slate-900 tabular-nums">12k</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Rep</div>
                       </div>
                    </div>

                    <button className="w-full ch-btn-outline py-4">
                       My Career Detail
                    </button>
                 </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                    <UserPlus className="w-4 h-4 text-orange-600" />
                    Suggested Rivals
                 </h3>
                 <div className="space-y-6">
                    {[
                      { name: "Sandeep N.", rank: "#4 Raider", img: "S" },
                      { name: "Mohit G.", rank: "#2 Defender", img: "M" },
                      { name: "Arjun P.", rank: "All-Rounder", img: "A" }
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-300 group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-100 transition-all">{s.img}</div>
                           <div>
                              <div className="text-sm font-black italic uppercase tracking-tighter text-slate-900 group-hover:text-orange-600 transition-colors">{s.name}</div>
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.rank}</div>
                           </div>
                        </div>
                        <button className="p-2.5 bg-slate-50 rounded-xl text-slate-300 hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                           <Zap className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

        </main>
    </div>
  );

  if (isSpectator || role === "PUBLIC") {
    return <PublicLayout>{Content}</PublicLayout>;
  }

  return (
    <DashboardLayout variant="user">
       {Content}
    </DashboardLayout>
  );
}

export default function ChallengesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <ChallengesContent />
    </Suspense>
  );
}
