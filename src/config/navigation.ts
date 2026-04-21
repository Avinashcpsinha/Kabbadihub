import React from "react";
import {
  LayoutDashboard, Users, Trophy, Target, 
  Zap, Gavel, MapPin, Megaphone, BarChart3, 
  Settings, Building2, PieChart, FileText, 
  Activity, Star, Heart, TrendingUp, Search
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // We'll map these to components in the layout
  badge?: string;
}

export const SUPER_ADMIN_NAV: NavItem[] = [
  { label: "Tenant Registry", href: "/super-admin", icon: "Building2" },
  { label: "Platform Analytics", href: "/super-admin/analytics", icon: "PieChart" },
  { label: "Audit Logs", href: "/super-admin/audit", icon: "FileText" },
  { label: "Seed Data", href: "/super-admin/seed", icon: "Activity" },
];

export const ORGANISER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Teams", href: "/teams", icon: "Users" },
  { label: "Players", href: "/players", icon: "Target" },
  { label: "Matches", href: "/tournaments", icon: "Trophy" },
  { label: "Live Scoring", href: "/scoring", icon: "Zap" },
  { label: "Auction", href: "/auction", icon: "Gavel" },
  { label: "Venues", href: "/clubs", icon: "MapPin" },
  { label: "Announcements", href: "/admin/announcements", icon: "Megaphone" },
  { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
];

export const ATHLETE_NAV: NavItem[] = [
  { label: "Pro Dashboard", href: "/user/dashboard", icon: "LayoutDashboard" },
  { label: "My Profile", href: "/user/profile", icon: "Target" },
  { label: "Leaderboard", href: "/players", icon: "TrendingUp" },
  { label: "Matches", href: "/matches", icon: "Trophy" },
  { label: "Trials & Clubs", href: "/teams", icon: "Users" },
  { label: "Challenges", href: "/challenges", icon: "Zap" },
  { label: "Recent Results", href: "/results", icon: "Star" },
];

export const FAN_NAV: NavItem[] = [
  { label: "My Dashboard", href: "/user/dashboard", icon: "LayoutDashboard" },
  { label: "Browse Matches", href: "/matches", icon: "Activity" },
  { label: "Followed Teams", href: "/teams", icon: "Heart" },
  { label: "Tournaments", href: "/tournaments", icon: "Trophy" },
  { label: "Leaderboard", href: "/players", icon: "TrendingUp" },
  { label: "Recent Results", href: "/results", icon: "Star" },
];

export const ICON_MAP: Record<string, any> = {
  LayoutDashboard, Users, Trophy, Target, Zap, 
  Gavel, MapPin, Megaphone, BarChart3, Settings, 
  Building2, PieChart, FileText, Activity, Star, 
  Heart, TrendingUp, Search
};
