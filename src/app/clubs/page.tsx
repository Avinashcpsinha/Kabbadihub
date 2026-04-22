"use client";

import React, { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ShoppingBag, MapPin, Clock, TrendingUp, Plus, 
  Settings, Search, ChevronRight, ShieldCheck, 
  ArrowLeft, Star, Users, Calendar, LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function ClubManagementPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState("grounds");

  const grounds = [
    { 
      id: "g1", 
      name: "Shivaji Stadium - Mat 1", 
      type: "Professional Rubber Mat", 
      price: "₹800/hr", 
      status: "Available",
      bookingsToday: 12,
      rating: 4.8
    },
    { 
      id: "g2", 
      name: "Shivaji Stadium - Mat 2", 
      type: "Professional Rubber Mat", 
      price: "₹800/hr", 
      status: "Booked",
      bookingsToday: 8,
      rating: 4.6
    },
    { 
      id: "g3", 
      name: "Outdoor Sandbox Ground", 
      type: "Traditional Soil", 
      price: "₹400/hr", 
      status: "Maintenance",
      bookingsToday: 0,
      rating: 4.2
    }
  ];

  const Content = (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-20 space-y-12 bg-transparent">
       
       {/* Header Section - Only show if Public */}
       {role === "PUBLIC" && (
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
             <button 
               onClick={() => router.back()} 
               className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center shadow-sm"
             >
               <ArrowLeft className="w-5 h-5 text-slate-400" />
             </button>
             <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-2">
                 <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Verified Facility Owner</span>
               </div>
               <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Club Management</h1>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility ID: #F-7721</span>
               <span className="text-sm font-black text-slate-900 italic">SHIVAJI SPORTS HUB</span>
             </div>
             {role === "ORGANISER" && (
               <button className="ch-btn-primary px-8 py-4 shadow-xl shadow-orange-600/20">
                 <Plus className="w-5 h-5" /> Add Ground
               </button>
             )}
           </div>
         </header>
       )}

        {/* Analytics Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: "Today's Revenue", val: "₹14,200", trend: "+12%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
             { label: "Total Bookings", val: "24", trend: "+4", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
             { label: "Unique Players", val: "156", trend: "+22", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
             { label: "Occupancy Rate", val: "84%", trend: "High", icon: LayoutDashboard, color: "text-purple-600", bg: "bg-purple-50" }
           ].map((s, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 group"
             >
               <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-2", s.bg, s.color)}>
                  <s.icon className="w-6 h-6" />
               </div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</div>
               <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-black italic tabular-nums text-slate-900">{s.val}</div>
                  <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded italic">{s.trend}</div>
               </div>
             </motion.div>
           ))}
        </div>

        {/* Grounds Management List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-900">
               <ShoppingBag className="w-6 h-6 text-orange-600" />
               Your Grounds & Mats
             </h2>
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search grounds..."
                  className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-sm w-[280px] focus:outline-none focus:border-orange-500/50 shadow-sm"
                />
             </div>
          </div>

          <div className="grid gap-6">
            {grounds.map((ground, i) => (
              <motion.div 
                key={ground.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-orange-200 transition-all hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="flex gap-8 items-center flex-1">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center relative shadow-inner">
                     <MapPin className="w-8 h-8 text-orange-600" />
                     <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[10px] font-bold text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                     </div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-black italic uppercase text-slate-900 leading-none mb-2">{ground.name}</h3>
                     <p className="text-slate-500 text-sm font-medium mb-4">{ground.type}</p>
                     <div className="flex gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                           <Clock className="w-4 h-4 text-slate-300" />
                           {ground.bookingsToday} bookings today
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                           <Star className="w-4 h-4 text-amber-500 fill-current" />
                           {ground.rating} rating
                        </span>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                   <div className="text-center">
                      <div className="text-2xl font-black italic tabular-nums text-slate-900">{ground.price}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Rate</div>
                   </div>
                   
                   <div className={cn(
                     "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border italic",
                     ground.status === "Available" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                     ground.status === "Booked" ? "bg-orange-50 text-orange-600 border-orange-100" :
                     "bg-red-50 text-red-600 border-red-100"
                   )}>
                      {ground.status}
                   </div>

                   <button className="p-4 bg-slate-50 rounded-2xl hover:bg-orange-600 hover:text-white transition-all text-slate-300 shadow-sm">
                      <ChevronRight className="w-6 h-6" />
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Activity / Bookings Table */}
        <section>
           <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-black italic uppercase text-slate-900">Recent Ledger</h3>
               <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest underline underline-offset-4 decoration-2">Export Full Report</button>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                      <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Ground</th>
                      <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Team / Entity</th>
                      <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { time: "06:00 PM", ground: "Mat 1", name: "Dabang Delhi Training", type: "Pro Team", amount: "₹800", status: "Paid" },
                      { time: "07:00 PM", ground: "Mat 1", name: "Warriors Selection", type: "Academy", amount: "₹800", status: "Paid" },
                      { time: "08:00 PM", ground: "Mat 2", name: "Public Group Match", type: "Public", amount: "₹800", status: "Pending" },
                    ].map((b, i) => (
                      <tr key={i} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-6 text-sm font-black italic text-slate-900">{b.time}</td>
                        <td className="py-6 text-sm font-bold text-slate-500">{b.ground}</td>
                        <td className="py-6">
                           <div className="text-sm font-black italic uppercase text-slate-900">{b.name}</div>
                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{b.type}</div>
                        </td>
                        <td className="py-6">
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest italic px-3 py-1 rounded-full",
                             b.status === "Paid" ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-amber-600 bg-amber-50 border border-amber-100"
                           )}>
                             {b.status}
                           </span>
                        </td>
                        <td className="py-6 text-right font-black italic tabular-nums text-slate-900">{b.amount}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
        </section>
      </div>
    );

  if (role === "PUBLIC") return <PublicLayout>{Content}</PublicLayout>;
  return (
    <DashboardLayout variant="user">
       {Content}
    </DashboardLayout>
  );
}
