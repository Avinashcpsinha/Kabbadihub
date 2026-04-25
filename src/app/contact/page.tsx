"use client";

import React from "react";
import PublicLayout from "@/components/PublicLayout";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-50 pt-20 pb-40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Contact <span className="text-orange-600">Arena</span></h1>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Reach out to the KabaddiHub tactical command.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-6">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">Email Support</h4>
                  <p className="text-slate-500 text-sm">support@kabaddihub.com</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">Tactical Line</h4>
                  <p className="text-slate-500 text-sm">+91 98765 43210</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">HQ Location</h4>
                  <p className="text-slate-500 text-sm">Bengaluru Tactical Center, India</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                  <input type="text" className="ch-input py-4" placeholder="TACTICAL OFFICER" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Inquiry Type</label>
                  <select className="ch-input py-4 appearance-none">
                    <option>General Support</option>
                    <option>Franchise Enrollment</option>
                    <option>Technical Issue</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Message</label>
                  <textarea className="ch-input py-4 h-32 resize-none" placeholder="DEPLOY MESSAGE..."></textarea>
                </div>
                <button className="w-full ch-btn-primary py-5 flex items-center justify-center gap-3">
                  Transmit Signal <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
