"use client";

import React from "react";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Play, 
  Shield, 
  TrendingUp, 
  Award, 
  Search,
  Bell,
  Zap,
  Star,
  Activity,
  ArrowRight,
  ChevronRight,
  Globe,
  PieChart,
  Target,
  Rocket,
  ShieldCheck,
  Camera,
  Video,
  Mail,
  X,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const FloatSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function PremiumLandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isWatchModalOpen, setIsWatchModalOpen] = React.useState(false);
  const [activeMatches, setActiveMatches] = React.useState<any[]>([]);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Function to scan for active matches in local storage
  const scanMatches = React.useCallback(() => {
    const live: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Format: kabaddi_{tenantId}_match_{matchId}_state
      if (key?.startsWith('kabaddi_') && key.endsWith('_state') && key.includes('_match_')) {
        try {
          const state = JSON.parse(localStorage.getItem(key) || "{}");
          const parts = key.split('_');
          const matchIndex = parts.indexOf('match');
          const matchId = parts[matchIndex + 1];
          // Skip the generic 'match_state' key to avoid duplicate 'state' IDs
          if (matchId && matchId !== 'state') {
            live.push({ id: matchId, ...state });
          }
        } catch (e) {
          console.error("Error parsing match state", e);
        }
      }
    }
    setActiveMatches(live);
  }, []);

  React.useEffect(() => {
    scanMatches();
    // Refresh scores every 10 seconds on the landing page
    const interval = setInterval(scanMatches, 10000);
    return () => clearInterval(interval);
  }, [scanMatches]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-orange-600 origin-left z-[100]" style={{ scaleX }} />

      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
             <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20 group-hover:rotate-12 transition-transform">
                   <Zap className="w-6 h-6 fill-current" />
                </div>
                <span className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">KabaddiHub</span>
             </Link>
             <div className="hidden lg:flex items-center gap-8">
                {[
                  { label: "Matches", href: "/matches" },
                  { label: "Tournaments", href: "/tournaments" },
                  { label: "Players", href: "/players" },
                  { label: "Teams", href: "/teams" },
                  { label: "Results", href: "/results" },
                  { label: "Challenges", href: "/challenges" },
                ].map(l => (
                  <Link 
                    key={l.label} 
                    href={l.href} 
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
             </div>
          </div>
             <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <Search className="w-4 h-4 text-slate-400 ml-2" />
                <input placeholder="Search Pro Players..." className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none w-40 text-slate-900 placeholder:text-slate-300" />
             </div>
             {isAuthenticated ? (
               <Link href="/user/dashboard" className="ch-btn-primary px-8 py-4 shadow-xl shadow-orange-600/10">My Dashboard</Link>
             ) : (
               <Link href="/login" className="ch-btn-primary px-8 py-4 shadow-xl shadow-orange-600/10">Sign In</Link>
             )}
        </div>
      </nav>

      {/* Animated Hero Section */}
      <header className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-white/10 bg-slate-950">
         {/* Background Image with Overlay */}
         <div 
           className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-ken-burns"
           style={{ 
             backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 100%), url('/kabaddi_hero.png')` 
           }}
         />
         
         <div className="max-w-7xl mx-auto px-8 py-24 relative z-10 w-full">
            <div className="max-w-4xl space-y-10">
               <motion.div 
                 initial={{ x: -50, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 className="inline-flex items-center gap-3 px-5 py-2.5 bg-orange-600/20 text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/30 backdrop-blur-md"
               >
                  <Star className="w-4 h-4 fill-current animate-pulse" /> Official Digital Ecosystem Partner
               </motion.div>
               
               <motion.h1 
                 initial={{ y: 30, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="text-[5rem] md:text-[8rem] font-black italic tracking-tighter uppercase text-white leading-[0.8] drop-shadow-2xl"
               >
                  Digitizing <br/> <span className="ch-gradient-text">The Mat.</span>
               </motion.h1>

               <motion.p 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.4 }}
                 className="text-xl text-slate-300 font-medium max-w-lg leading-relaxed"
               >
                  The world's most advanced professional platform for Kabaddi management, precision live scoring, and career-defining analytics.
               </motion.p>
               
               <motion.div 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.6 }}
                 className="flex flex-wrap gap-6"
               >
                  <button 
                    onClick={() => {
                      scanMatches();
                      setIsWatchModalOpen(true);
                    }}
                    className="ch-btn-primary px-12 py-6 text-xs flex items-center gap-4 bg-slate-900 hover:bg-black transition-all group overflow-hidden relative"
                  >
                     <div className="absolute inset-0 bg-orange-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                     <Eye className="w-5 h-5 relative z-10" /> 
                     <span className="relative z-10">Watch Live Score</span>
                  </button>
                   <Link href="/user/register?type=athlete" className="px-12 py-6 bg-white/20 backdrop-blur-xl text-white border-2 border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 hover:border-orange-600 transition-all flex items-center gap-3 shadow-2xl group/btn">
                      Join as Athlete <Rocket className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                   </Link>
                   <Link href="/matches" className="px-12 py-6 bg-slate-900/50 backdrop-blur-xl text-white border-2 border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all flex items-center gap-3 shadow-2xl">
                      Schedule Center <Calendar className="w-5 h-5" />
                   </Link>
               </motion.div>

               {/* Smart Live Ticker */}
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1 }}
                 onClick={() => {
                   if (activeMatches.length === 1) {
                     router.push(`/overlay?id=${activeMatches[0].id}`);
                   } else {
                     scanMatches();
                     setIsWatchModalOpen(true);
                   }
                 }}
                 className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 w-fit cursor-pointer hover:bg-white/20 transition-all group shadow-2xl"
               >
                  <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-900 shadow-sm flex items-center justify-center text-[10px] font-black text-white">T</div>
                     <div className="w-8 h-8 rounded-full bg-orange-600 border-2 border-slate-900 shadow-sm flex items-center justify-center text-[10px] font-black text-white">B</div>
                  </div>
                  <div>
                     <div className="text-[8px] font-black uppercase tracking-widest text-slate-300">
                       {activeMatches.length > 0 ? "Now Raiding" : "Next Up: Titans vs Bulls"}
                     </div>
                     <div className="text-[10px] font-black flex items-center gap-2 text-white">
                        {activeMatches.length === 1 
                          ? `${activeMatches[0].home.shortName} ${activeMatches[0].home.score} - ${activeMatches[0].away.score} ${activeMatches[0].away.shortName}`
                          : activeMatches.length > 1 
                            ? `${activeMatches.length} Matches Live Now`
                            : "Pro Season Highlights"}
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", activeMatches.length > 0 ? "bg-red-500" : "bg-orange-500")} />
                        <ChevronRight className="w-3 h-3 text-white/30 group-hover:text-orange-600 transition-colors" />
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </header>

      {/* Watch Live Modal */}
      <AnimatePresence>
        {isWatchModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsWatchModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl relative overflow-hidden"
             >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                   <div>
                      <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Live Arena Center</h2>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Found {activeMatches.length} Ongoing Battles</p>
                   </div>
                   <button onClick={() => setIsWatchModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                   {activeMatches.length > 0 ? activeMatches.map((m, i) => (
                     <div 
                       key={m.id} 
                       onClick={() => {
                         setIsWatchModalOpen(false);
                         router.push(`/overlay?id=${m.id}`);
                       }}
                       className="block p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-orange-600/30 hover:shadow-xl transition-all group cursor-pointer"
                     >
                        <div className="flex items-center justify-between mb-6">
                           <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse" /> LIVE
                           </div>
                           <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{m.id}</div>
                        </div>
                        <div className="flex items-center justify-between">
                           <div className="text-center flex-1">
                              <div className="text-2xl font-black italic text-slate-900 uppercase">{m.home?.name || "Team A"}</div>
                           </div>
                           <div className="px-6 flex flex-col items-center">
                              <div className="text-4xl font-black tabular-nums text-orange-600 leading-none">{m.home?.score || 0} : {m.away?.score || 0}</div>
                              <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">{Math.floor((m.timer || 0) / 60)}:{(m.timer || 0) % 60 < 10 ? '0' : ''}{(m.timer || 0) % 60} Remaining</div>
                           </div>
                           <div className="text-center flex-1">
                              <div className="text-2xl font-black italic text-slate-900 uppercase">{m.away?.name || "Team B"}</div>
                           </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              {m.lastAction ? <><Activity className="w-3 h-3 text-orange-500" /> {m.lastAction}</> : "Awaiting Raid Action..."}
                           </div>
                           <div className="text-orange-600 text-[9px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-2">
                              Enter Arena <ChevronRight className="w-3 h-3" />
                           </div>
                        </div>
                     </div>
                   )) : (
                     <div className="py-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                           <Zap className="w-10 h-10" />
                        </div>
                        <div>
                           <div className="text-sm font-black uppercase italic tracking-wider text-slate-900">No Heroics Currently Live</div>
                           <p className="text-[10px] font-medium text-slate-400 max-w-[200px] mx-auto mt-2 leading-relaxed">Check back during scheduled match times for real-time battle coverage.</p>
                        </div>
                        <Link href="/matches" className="inline-flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                           View Full Schedule <Calendar className="w-4 h-4" />
                        </Link>
                     </div>
                   )}
                </div>
                
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Global Digital Broadcast System • High-Fidelity Feed</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Section with Corrected Numbers */}
      <section className="bg-white border-b border-slate-200">
         <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: "Elite Raiders", val: "24K+", color: "text-blue-600" },
              { label: "Global Tournaments", val: "1.2K", color: "text-orange-600" },
              { label: "Matches Hosted", val: "185K+", color: "text-emerald-600" },
              { label: "Active Viewers", val: "3.2M", color: "text-purple-600" }
            ].map((s, i) => (
              <div key={i} className="p-12 text-center group hover:bg-slate-50/50 transition-colors">
                 <div className={cn("text-5xl font-black italic tracking-tighter mb-2 transition-transform group-hover:scale-110", s.color)}>{s.val}</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{s.label}</div>
              </div>
            ))}
         </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-32 px-8">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600">The Modern Ecosystem</h2>
               <h3 className="text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Built for the <span className="ch-gradient-text">Future of Pro Sport.</span></h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { title: "Precision Scoring", desc: "Military-grade timing and scoring console built for sub-second reactive play.", icon: <Zap />, bg: "bg-orange-50", color: "text-orange-600" },
                 { title: "Broadcast Stitch", desc: "Seamlessly stitch live scores into any broadcast signal or OBS stream locally.", icon: <Activity />, bg: "bg-blue-50", color: "text-blue-600" },
                 { title: "Elite Recruitment", desc: "Transparent player market with verified stats and career timelines.", icon: <Target />, bg: "bg-emerald-50", color: "text-emerald-600" },
                 { title: "Tournament Hub", desc: "Automated bracket generation and multi-tenant organizational control.", icon: <Globe />, bg: "bg-purple-50", color: "text-purple-600" },
                 { title: "Cloud Analytics", desc: "Deep drilldown into player density, raid success ratios, and team density.", icon: <PieChart />, bg: "bg-pink-50", color: "text-pink-600" },
                 { title: "Governance Control", desc: "Secure multi-tenant architecture with white-label portal capabilities.", icon: <ShieldCheck />, bg: "bg-slate-900", color: "text-white" }
               ].map((f, i) => (
                 <FloatSection key={i} delay={i * 0.1}>
                    <div className="h-full p-12 bg-white rounded-[3rem] border border-slate-100 hover:border-orange-600/20 transition-all hover:shadow-2xl hover:shadow-slate-200/50 group">
                       <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:rotate-6 transition-all", f.bg, f.color)}>{f.icon}</div>
                       <h4 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">{f.title}</h4>
                       <p className="text-slate-500 font-medium leading-relaxed mb-8">{f.desc}</p>
                       <Link href="/developers" className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-600 flex items-center gap-2 transition-colors">
                          Learn Architecture <ChevronRight className="w-4 h-4" />
                       </Link>
                    </div>
                 </FloatSection>
               ))}
            </div>
         </div>
      </section>

      {/* Elite Awards Section */}
      <section className="py-32 bg-slate-900 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-600/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
         
         <div className="max-w-7xl mx-auto px-8 relative z-10 grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Elite Recognition</h2>
               <h3 className="text-7xl font-black italic uppercase tracking-tighter text-white leading-none">KabaddiHub Elite Awards <span className="text-orange-600">2026</span></h3>
               <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg">Recognizing the architects of our sport. From the most efficient raiders to the visionary league directors, we celebrate the best of digital Kabaddi.</p>
               <div className="flex flex-col gap-6">
                  {[
                    "Most Consistent Raider of the Year",
                    "Innovative League Management Award",
                    "Fan Engagement Excellence"
                  ].map((award, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all"
                    >
                       <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white"><Award className="w-6 h-6" /></div>
                       <div className="text-sm font-black uppercase italic tracking-wider text-white">{award}</div>
                    </motion.div>
                  ))}
               </div>
            </div>
            <div className="bg-white/5 p-12 rounded-[4rem] border border-white/5 backdrop-blur-xl relative">
                <div className="space-y-8">
                   <div className="text-center">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-4">Nominations Open In</div>
                      <div className="grid grid-cols-4 gap-4">
                         {["142d", "12h", "45m", "11s"].map((t, i) => (
                           <div key={i} className="bg-slate-900 p-6 rounded-3xl border border-white/5 text-center">
                              <div className="text-4xl font-black italic text-white">{t}</div>
                           </div>
                         ))}
                      </div>
                   </div>
                    <div className="p-8 bg-orange-600 rounded-[2.5rem] text-center space-y-6">
                       <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">Join the Elite Registry</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Link href="/user/register?type=athlete" className="bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all">
                             Register as Pro <Rocket className="w-4 h-4" />
                          </Link>
                          <Link href="/register" className="bg-white text-orange-600 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                             Organisation <ShieldCheck className="w-4 h-4" />
                          </Link>
                       </div>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Multi-Column Premium Footer */}
      <footer className="bg-white border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-8 pt-24 pb-12">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-16 mb-24">
               <div className="col-span-2 space-y-8">
                  <Link href="/" className="flex items-center gap-2 group">
                     <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20 group-hover:rotate-12 transition-transform">
                        <Zap className="w-7 h-7 fill-current" />
                     </div>
                     <span className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">KabaddiHub</span>
                  </Link>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-sm">Elevating the spirit of Kabaddi through world-class digital infrastructure and transparent athlete analytics.</p>
                  <div className="flex gap-4">
                     {[Camera, Video, Globe, Mail].map((Icon, i) => (
                       <button key={i} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all">
                          <Icon className="w-5 h-5" />
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Platform</h4>
                  <ul className="space-y-4">
                    {[
                      { label: "Matches", href: "/matches" },
                      { label: "Tournaments", href: "/tournaments" },
                      { label: "Players", href: "/players" },
                      { label: "Teams", href: "/teams" },
                      { label: "Results", href: "/results" }
                    ].map(l => (
                      <li key={l.label}><Link href={l.href} className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">{l.label}</Link></li>
                    ))}
                  </ul>
               </div>

               <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Community</h4>
                  <ul className="space-y-4">
                    {[
                      { label: "Challenges", href: "/challenges" },
                      { label: "Clubs", href: "/clubs" },
                      { label: "Register as Fan", href: "/user/register" },
                      { label: "Partner Program", href: "#" },
                      { label: "Fan Elite", href: "#" }
                    ].map(l => (
                      <li key={l.label}><Link href={l.href} className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">{l.label}</Link></li>
                    ))}
                  </ul>
               </div>

               <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Governance</h4>
                  <ul className="space-y-4">
                    {[
                      { label: "Admin Console", href: "/login" },
                      { label: "Register Org", href: "/register" },
                      { label: "Super Admin", href: "/login" },
                      { label: "API Portal", href: "#" },
                      { label: "Security", href: "#" }
                    ].map(l => (
                      <li key={l.label}><Link href={l.href} className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">{l.label}</Link></li>
                    ))}
                  </ul>
               </div>
            </div>

            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">© 2026 KabaddiHub Digital Services. Verified Session.</div>
               <div className="flex gap-10">
                  {["Privacy", "Terms", "Cookie Policy", "Legal"].map(l => (
                    <Link key={l} href="#" className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-orange-600 transition-colors">{l}</Link>
                  ))}
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
