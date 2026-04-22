"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "PUBLIC" | "USER" | "ORGANISER" | "SUPER_ADMIN";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  avatarInitial: string;
  position?: "RAIDER" | "DEFENDER" | "ALL_ROUNDER";
  bio?: string;
  city?: string;
  height?: string;
  weight?: string;
  panCard?: string;
  aadharCard?: string;
  photoUrl?: string;
  followedTeams: string[];
  joinedAt: number;
}

interface AuthContextType {
  role: UserRole;
  currentUser: AppUser | null;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  logout: () => void;
  registerUser: (data: { 
    name: string; 
    email: string; 
    password: string; 
    position?: string; 
    city?: string;
    height?: string;
    weight?: string;
    panCard?: string;
    aadharCard?: string;
    photoUrl?: string;
  }) => AppUser | null;
  loginUser: (email: string, password: string) => { success: boolean; error?: string };
  updateUser: (updates: Partial<AppUser>) => void;
  allUsers: AppUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "kabaddihub_all_users";
const USER_CREDS_KEY = "kabaddihub_user_creds";
const SESSION_KEY = "kabaddihub_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state synchronously in the client to prevent "Sign In" flash
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        try {
          return JSON.parse(session).role;
        } catch (e) {
          return "PUBLIC";
        }
      }
      return (localStorage.getItem("kabaddihub_user_role") as UserRole) || "PUBLIC";
    }
    return "PUBLIC";
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        try {
          return JSON.parse(session).user;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  const [allUsers, setAllUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load all users
      const savedUsers = localStorage.getItem(USERS_KEY);
      if (savedUsers) setAllUsers(JSON.parse(savedUsers));
    }
  }, []);

  const saveSession = (user: AppUser | null, userRole: UserRole) => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ role: userRole, user }));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("kabaddihub_user_role", newRole);
    if (newRole === "PUBLIC") {
      localStorage.removeItem(SESSION_KEY);
    } else {
      const existingSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...existingSession, role: newRole }));
    }
  };

  const registerUser = (data: { 
    name: string; 
    email: string; 
    password: string; 
    position?: string; 
    city?: string;
    height?: string;
    weight?: string;
    panCard?: string;
    aadharCard?: string;
    photoUrl?: string;
  }) => {
    // Check if user already exists
    const creds = JSON.parse(localStorage.getItem(USER_CREDS_KEY) || "[]");
    if (creds.find((c: any) => c.email.toLowerCase() === data.email.toLowerCase())) {
      return null; // User already exists
    }

    const newUser: AppUser = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: "USER",
      avatarInitial: data.name.charAt(0).toUpperCase(),
      position: data.position as any || undefined,
      city: data.city || undefined,
      height: data.height || undefined,
      weight: data.weight || undefined,
      panCard: data.panCard || undefined,
      aadharCard: data.aadharCard || undefined,
      photoUrl: data.photoUrl || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=256&h=256&auto=format&fit=crop", 
      bio: "",
      followedTeams: [],
      joinedAt: Date.now(),
    };

    // Save credentials
    creds.push({ email: data.email.toLowerCase(), password: data.password, userId: newUser.id });
    localStorage.setItem(USER_CREDS_KEY, JSON.stringify(creds));

    // Save user
    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    // Auto-login
    setCurrentUser(newUser);
    setRoleState("USER");
    saveSession(newUser, "USER");

    return newUser;
  };

  const loginUser = (email: string, password: string): { success: boolean; error?: string } => {
    const creds = JSON.parse(localStorage.getItem(USER_CREDS_KEY) || "[]");
    const found = creds.find((c: any) => c.email.toLowerCase() === email.toLowerCase() && c.password === password);

    if (!found) {
      return { success: false, error: "Invalid email or password." };
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const user = users.find((u: AppUser) => u.id === found.userId);

    if (!user) {
      return { success: false, error: "User account not found." };
    }

    setCurrentUser(user);
    setRoleState("USER");
    saveSession(user, "USER");
    return { success: true };
  };

  const updateUser = (updates: Partial<AppUser>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    const updatedUsers = allUsers.map(u => u.id === updated.id ? updated : u);
    setAllUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    saveSession(updated, role);
  };

  const logout = () => {
    setRoleState("PUBLIC");
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("kabaddihub_user_role");
    localStorage.removeItem("kabaddihub_impersonated_tenant_id");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{
      role,
      currentUser,
      setRole,
      isAuthenticated: role !== "PUBLIC",
      logout,
      registerUser,
      loginUser,
      updateUser,
      allUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
