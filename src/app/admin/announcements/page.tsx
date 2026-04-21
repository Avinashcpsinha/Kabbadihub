"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Megaphone, Plus, Search, Filter, MoreVertical, 
  Trash2, Edit3, CheckCircle2, AlertCircle, Info, 
  Clock, Calendar, User, Trophy, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Announcement } from "@/types";

export default function AdminAnnouncementsPage() {
  const { tenant } = useTenant();
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "INFO" as Announcement["type"]
  });

  const storageKey = tenant ? `kabaddihub_${tenant.id}_announcements` : "";

  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) setAnnouncements(JSON.parse(saved));
  }, [storageKey]);

  const saveAnnouncements = (list: Announcement[]) => {
    setAnnouncements(list);
    localStorage.setItem(storageKey, JSON.stringify(list));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !tenant) return;

    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      tenantId: tenant.id,
      title: formData.title,
      content: formData.content,
      type: formData.type,
      createdAt: Date.now(),
      authorName: currentUser.name
    };

    saveAnnouncements([newAnnouncement, ...announcements]);
    setIsModalOpen(false);
    setFormData({ title: "", content: "", type: "INFO" });
  };

  const deleteAnnouncement = (id: string) => {
    saveAnnouncements(announcements.filter(a => a.id !== id));
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

  return (
    <DashboardLayout variant="organiser">
      <div className="p-6 md:p-10 space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
              Announcements
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Broadcast news and updates to your organization.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ch-btn-primary px-6 py-3"
          >
            <Plus className="w-4 h-4" /> Create Announcement
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((ann, i) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row gap-6 hover:border-orange-200 transition-all shadow-sm"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                  getTypeStyles(ann.type)
                )}>
                  {getTypeIcon(ann.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black italic uppercase text-slate-900">{ann.title}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                      getTypeStyles(ann.type)
                    )}>
                      {ann.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">{ann.content}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <User className="w-3.5 h-3.5" />
                      {ann.authorName}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <button 
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <Megaphone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-black italic uppercase text-slate-900 mb-1">No Announcements Yet</h3>
              <p className="text-sm text-slate-400">Your organization’s news feed is empty.</p>
            </div>
          )}
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setIsModalOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 md:p-10 relative z-10 shadow-2xl overflow-hidden"
              >
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 flex items-center gap-3">
                  <Megaphone className="w-6 h-6 text-orange-600" /> New Broadcast
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Headline</label>
                    <input 
                      required
                      type="text"
                      className="ch-input"
                      placeholder="Enter a catchy headline..."
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Broadcast Type</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {(["INFO", "MATCH", "TRANSFER", "URGENT"] as Announcement["type"][]).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, type})}
                          className={cn(
                            "py-3 rounded-xl text-[9px] font-black border transition-all",
                            formData.type === type 
                              ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                              : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Content</label>
                    <textarea 
                      required
                      className="ch-input min-h-[120px] resize-none"
                      placeholder="What's the news?"
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-8 py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-8 py-4 bg-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500 transition-all flex items-center justify-center gap-2"
                    >
                      <Megaphone className="w-4 h-4" /> Broadcast
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
