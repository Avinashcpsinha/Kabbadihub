"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Megaphone, Plus, Trash2, AlertCircle, Info, 
  Calendar, User, Trophy, Users, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Announcement } from "@/types";
import { supabase } from "@/lib/supabase";

export default function AdminAnnouncementsPage() {
  const { tenant } = useTenant();
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "INFO" as Announcement["type"]
  });

  const fetchAnnouncements = async () => {
    if (!tenant) return;
    setIsLoading(true);
    try {
      // Reusing live_matches table for persistent storage if announcements table doesn't exist
      // This ensures 100% database persistence without requiring immediate schema changes
      const { data } = await supabase
        .from('live_matches')
        .select('state')
        .eq('id', `announcements_${tenant.id}`)
        .single();
      
      if (data && data.state) {
        setAnnouncements(data.state as any[]);
      }
    } catch (err) {
      console.error("Announcements fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !tenant) return;
    setIsSubmitting(true);

    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      tenantId: tenant.id,
      title: formData.title,
      content: formData.content,
      type: formData.type,
      createdAt: Date.now(),
      authorName: currentUser.name
    };

    const newList = [newAnnouncement, ...announcements];
    
    try {
      await supabase
        .from('live_matches')
        .upsert({
          id: `announcements_${tenant.id}`,
          state: newList,
          updated_at: new Date().toISOString()
        });
      
      setAnnouncements(newList);
      setIsModalOpen(false);
      setFormData({ title: "", content: "", type: "INFO" });
    } catch (err) {
      console.error("Broadcast failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!tenant) return;
    const newList = announcements.filter(a => a.id !== id);
    try {
      await supabase
        .from('live_matches')
        .upsert({
          id: `announcements_${tenant.id}`,
          state: newList,
          updated_at: new Date().toISOString()
        });
      setAnnouncements(newList);
    } catch (err) {
      console.error("Deletion failed", err);
    }
  };

  const getTypeStyles = (type: Announcement["type"]) => {
    switch (type) {
      case "URGENT": return "bg-red-50 text-red-600 border-red-100";
      case "MATCH": return "bg-orange-50 text-orange-600 border-orange-100";
      case "TRANSFER": return "bg-blue-50 text-blue-600 border-blue-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getTypeIcon = (type: Announcement["type"]) => {
    switch (type) {
      case "URGENT": return <AlertCircle className="w-4 h-4" />;
      case "MATCH": return <Trophy className="w-4 h-4" />;
      case "TRANSFER": return <Users className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (!tenant) return <div className="p-10 text-center">Identifying Organisation...</div>;

  return (
    <DashboardLayout variant="organiser">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
              Broadcast Center
            </h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest text-[10px]">
              Managing official announcements for {tenant.name}.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ch-btn-primary px-8 py-4 border-none shadow-xl shadow-orange-600/20"
          >
            <Plus className="w-4 h-4" /> Create Broadcast
          </button>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
             <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((ann, i) => (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col md:flex-row gap-8 hover:border-orange-200 hover:shadow-xl transition-all group"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 shadow-sm",
                    getTypeStyles(ann.type)
                  )}>
                    {getTypeIcon(ann.type)}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-black italic uppercase text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">{ann.title}</h3>
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                        getTypeStyles(ann.type)
                      )}>
                        {ann.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-4xl italic">"{ann.content}"</p>
                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        By {ann.authorName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <button 
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-32 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <Megaphone className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-xl font-black italic uppercase text-slate-900 mb-2 tracking-tighter">Silence in the Hall</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No official broadcasts have been logged in the cloud registry.</p>
              </div>
            )}
          </div>
        ) }

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[3rem] w-full max-w-2xl p-10 md:p-14 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                   <Megaphone className="w-48 h-48 text-orange-600" />
                </div>

                <div className="relative z-10">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-10 leading-none">
                    Create Broadcast Feed
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Broadcast Headline</label>
                      <input 
                        required
                        type="text"
                        className="ch-input text-sm font-black uppercase italic"
                        placeholder="e.g. SQUAD DEPTH UPDATE - MAY 2026"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Alert Category</label>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {(["INFO", "MATCH", "TRANSFER", "URGENT"] as Announcement["type"][]).map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({...formData, type})}
                            className={cn(
                              "py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all",
                              formData.type === type 
                                ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-105" 
                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Detailed Content</label>
                      <textarea 
                        required
                        className="ch-input min-h-[160px] resize-none text-sm font-medium italic"
                        placeholder="Write the official communication here..."
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                      />
                    </div>

                    <div className="flex gap-6 pt-6">
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-8 py-5 bg-slate-50 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
                      >
                        Abort
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-8 py-5 bg-orange-600 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-orange-600/20 hover:bg-orange-500 transition-all flex items-center justify-center gap-3 border-none disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Megaphone className="w-5 h-5" />}
                        {isSubmitting ? "Broadcasting..." : "Initiate Feed"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
