import React from "react";
import {
  LayoutDashboard, Users, Trophy, Target, 
  Zap, Gavel, MapPin, Megaphone, BarChart3, 
  Settings, Building2, PieChart, FileText, 
  Activity, Star, Heart, TrendingUp, Search,
  Calendar, ShieldCheck, User, Mail, HelpCircle,
  ShoppingBag, Bell, ShieldAlert
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // We'll map these to components in the layout
  badge?: string;
}

export const SUPER_ADMIN_NAV: NavItem[] = [
  { label: "Admin Dashboard", href: "/super-admin/analytics", icon: "LayoutDashboard" },
  { label: "Tenant Management", href: "/super-admin", icon: "Building2" },
  { label: "User Management", href: "/super-admin/players", icon: "Users" },
  { label: "Organiser Approvals", href: "/super-admin/audit", icon: "ShieldCheck" },
  { label: "Subscriptions & Billing", href: "/super-admin/analytics", icon: "ShoppingBag" },
  { label: "Content Moderation", href: "/super-admin/audit", icon: "ShieldAlert" },
  { label: "System Config", href: "/super-admin/seed", icon: "Activity" },
  { label: "Audit Logs", href: "/super-admin/audit", icon: "FileText" },
  { label: "Global Analytics", href: "/super-admin/analytics", icon: "PieChart" },
  { label: "System Notifications", href: "/super-admin/seed", icon: "Megaphone" },
];

export const ORGANISER_NAV: NavItem[] = [
  { label: "Organiser Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Manage Tournaments", href: "/tournaments", icon: "Trophy" },
  { label: "Team Registrations", href: "/admin", icon: "Users" },
  { label: "Match Scheduling", href: "/tournaments", icon: "Calendar" },
  { label: "Live Match Control", href: "/scoring", icon: "Zap" },
  { label: "Player Management", href: "/players", icon: "Target" },
  { label: "Reports & Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { label: "Payments & Fees", href: "/admin/analytics", icon: "ShoppingBag" },
  { label: "Announcements", href: "/admin/announcements", icon: "Megaphone" },
  { label: "Organiser Settings", href: "/admin/settings", icon: "Settings" },
];

export const ATHLETE_NAV: NavItem[] = [
  { label: "My Hub", href: "/user/dashboard", icon: "LayoutDashboard" },
  { label: "Live Scores", href: "/matches?view=spectator", icon: "Zap" },
  { label: "Tournaments", href: "/tournaments?view=spectator", icon: "Trophy" },
  { label: "Teams & Players", href: "/teams?view=spectator", icon: "Users" },
  { label: "Fixtures & Results", href: "/results?view=spectator", icon: "Calendar" },
  { label: "Standings", href: "/players?view=spectator", icon: "TrendingUp" },
  { label: "My Profile", href: "/user/profile", icon: "User" },
  { label: "My Registrations", href: "/user/dashboard", icon: "ShieldCheck" },
  { label: "Notifications", href: "/user/dashboard", icon: "Bell" },
  { label: "Settings", href: "/user/profile", icon: "Settings" },
];

export const FAN_NAV: NavItem[] = [
  { label: "Discover", href: "/user/dashboard", icon: "Search" },
  { label: "Live Scores", href: "/matches?view=spectator", icon: "Zap" },
  { label: "Tournaments", href: "/tournaments?view=spectator", icon: "Trophy" },
  { label: "Teams", href: "/teams?view=spectator", icon: "Users" },
  { label: "Leaderboard", href: "/players?view=spectator", icon: "TrendingUp" },
  { label: "Results", href: "/results?view=spectator", icon: "Star" },
];

export const SHARED_NAV: NavItem[] = [
  { label: "News & Media", href: "/", icon: "Activity" },
  { label: "Help / FAQ", href: "/developers", icon: "HelpCircle" },
  { label: "About / Contact", href: "/developers", icon: "Mail" },
];

export const ICON_MAP: Record<string, any> = {
  LayoutDashboard, Users, Trophy, Target, Zap, 
  Gavel, MapPin, Megaphone, BarChart3, Settings, 
  Building2, PieChart, FileText, Activity, Star, 
  Heart, TrendingUp, Search, Calendar, ShieldCheck,
  User, HelpCircle, Mail, ShoppingBag, Bell, ShieldAlert
};
