"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Save, Camera, User, Phone, Mail, 
  Hash, IdCard, ShieldCheck, MapPin, 
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AthleteFormData {
  id?: string;
  name: string;
  number: string;
  phone: string;
  email: string;
  role: "RAIDER" | "DEFENDER" | "ALL_ROUNDER";
  weight: string;
  height: string;
  city: string;
  pan: string;
  aadhar: string;
  photo: string;
  kycStatus: "PENDING" | "VERIFIED" | "REJECTED";
  status: "ENABLED" | "DISABLED";
}

const DEFAULT_FORM: AthleteFormData = {
  name: "",
  number: "",
  phone: "",
  email: "",
  role: "RAIDER",
  weight: "",
  height: "",
  city: "",
  pan: "",
  aadhar: "",
  photo: "",
  kycStatus: "PENDING",
  status: "ENABLED",
};

interface AthleteRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AthleteFormData) => void;
  initialData?: Partial<AthleteFormData>;
  title?: string;
  subtitle?: string;
}

export default function AthleteRegistrationModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = "Register New Athlete",
  subtitle = "Complete all details for official enrollment into the Central Pool.",
}: AthleteRegistrationModalProps) {
  const [form, setForm] = useState<AthleteFormData>({ ...DEFAULT_FORM, ...initialData });
  const [step, setStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string>(initialData?.photo || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof AthleteFormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPhotoPreview(url);
      update("photo", url);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: initialData?.id || `ath_${Date.now()}` });
    setForm({ ...DEFAULT_FORM });
    setStep(1);
    setPhotoPreview("");
  };

  const isStep1Valid = form.name.trim() && form.number.trim() && form.phone.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-10 py-8 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-1">
                  {title}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {subtitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-300 transition-colors shrink-0 mt-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-10 py-5 flex items-center gap-3">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => step > s && setStep(s)}
                  className="flex items-center gap-2"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all",
                    step >= s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {s}
                  </div>
                  <span className={cn("text-[9px] font-black uppercase tracking-widest hidden sm:block", step >= s ? "text-slate-900" : "text-slate-300")}>
                    {s === 1 ? "Identity" : s === 2 ? "Physical & Contact" : "Compliance"}
                  </span>
                  {s < 3 && <ChevronRight className="w-3 h-3 text-slate-200 hidden sm:block" />}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-10 pb-10 space-y-8">

                {/* ─── STEP 1: Core Identity ─── */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center gap-4 pb-4">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="relative group"
                      >
                        <div className="w-28 h-28 rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center">
                          {photoPreview
                            ? <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                            : <User className="w-10 h-10 text-slate-300" />
                          }
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] flex items-center justify-center">
                          <Camera className="w-7 h-7 text-white" />
                        </div>
                      </button>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Click to Upload Athlete Photo
                      </span>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">
                          Full Legal Name *
                        </label>
                        <input
                          required
                          className="ch-input py-5 text-sm uppercase font-black"
                          placeholder="e.g. PAWAN SEHRAWAT"
                          value={form.name}
                          onChange={e => update("name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">
                          Jersey Number *
                        </label>
                        <input
                          required
                          maxLength={3}
                          className="ch-input py-5 text-sm font-black"
                          placeholder="e.g. 17"
                          value={form.number}
                          onChange={e => update("number", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">
                          Tactical Role *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {(["RAIDER", "DEFENDER", "ALL_ROUNDER"] as const).map(r => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => update("role", r)}
                              className={cn(
                                "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                form.role === r
                                  ? r === "RAIDER" ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-600/20"
                                    : r === "DEFENDER" ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                    : "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20"
                                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                              )}
                            >
                              {r.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!isStep1Valid}
                      onClick={() => setStep(2)}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-black transition-all"
                    >
                      Continue to Contact Details →
                    </button>
                  </div>
                )}

                {/* ─── STEP 2: Physical & Contact ─── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block flex items-center gap-2">
                          <Phone className="w-3 h-3" /> Mobile Number *
                        </label>
                        <input
                          required
                          type="tel"
                          className="ch-input py-5 text-sm font-black"
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={e => update("phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block flex items-center gap-2">
                          <Mail className="w-3 h-3" /> Official Email
                        </label>
                        <input
                          type="email"
                          className="ch-input py-5 text-sm font-medium"
                          placeholder="athlete@kabaddi.in"
                          value={form.email}
                          onChange={e => update("email", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-[2.5rem] p-8 grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">
                          Weight (KG)
                        </label>
                        <input
                          type="number"
                          className="ch-input bg-white py-5 text-sm font-black"
                          placeholder="78"
                          value={form.weight}
                          onChange={e => update("weight", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">
                          Height (CM)
                        </label>
                        <input
                          type="number"
                          className="ch-input bg-white py-5 text-sm font-black"
                          placeholder="178"
                          value={form.height}
                          onChange={e => update("height", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> City
                        </label>
                        <input
                          className="ch-input bg-white py-5 text-sm font-black uppercase"
                          placeholder="Rohtak"
                          value={form.city}
                          onChange={e => update("city", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(1)} className="px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">← Back</button>
                      <button type="button" onClick={() => setStep(3)} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Continue to Compliance →</button>
                    </div>
                  </div>
                )}

                {/* ─── STEP 3: Compliance / KYC ─── */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-slate-900 p-8 rounded-[2.5rem] space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block flex items-center gap-2">
                          <IdCard className="w-4 h-4" /> PAN Card Number
                        </label>
                        <input
                          className="w-full bg-white/10 text-white rounded-2xl px-6 py-4 text-sm font-black uppercase outline-none placeholder:text-white/30"
                          placeholder="ABCDE1234F"
                          maxLength={10}
                          value={form.pan}
                          onChange={e => update("pan", e.target.value.toUpperCase())}
                        />
                        <p className="text-[8px] font-bold text-slate-500">Tax Identity for Auction & Transfer Clearance</p>
                      </div>
                      <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Aadhar (UID) Number
                        </label>
                        <input
                          className="w-full bg-white rounded-2xl px-6 py-4 text-sm font-black outline-none shadow-sm"
                          placeholder="1234 5678 9012"
                          maxLength={14}
                          value={form.aadhar}
                          onChange={e => update("aadhar", e.target.value)}
                        />
                        <p className="text-[8px] font-bold text-slate-400">National ID Required for Pro League Eligibility</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 text-[10px] font-bold text-amber-700">
                      ⚡ KYC verification will be reviewed by the Super Admin. The athlete's status will be set to <strong>PENDING</strong> until documents are confirmed.
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setStep(2)} className="px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">← Back</button>
                      <button
                        type="submit"
                        className="flex-1 py-5 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-500 transition-all flex items-center justify-center gap-3"
                      >
                        <Save className="w-4 h-4" /> Confirm & Enroll Athlete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
