"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
    role?: UserRole;
  }) => Promise<AppUser | null>;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<AppUser>) => Promise<void>;
  allUsers: AppUser[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("PUBLIC");
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Safety Break: Never let the spinner run for more than 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Auth Safety Break: Force-clearing verify screen.");
        setIsLoading(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const fetchProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    if (profile) {
      const appUser: AppUser = {
        id: profile.id,
        name: profile.name,
        email: profile.email || "", // Profile might not have email, we get it from auth
        role: (profile.role as UserRole) || "USER",
        tenantId: profile.tenant_id,
        avatarInitial: profile.name?.charAt(0).toUpperCase() || "?",
        position: profile.position,
        city: profile.city,
        height: profile.height,
        weight: profile.weight,
        panCard: profile.pan_card,
        aadharCard: profile.aadhar_card,
        photoUrl: profile.photo_url,
        followedTeams: profile.followed_teams || [],
        joinedAt: new Date(profile.joined_at).getTime(),
      };
      return appUser;
    }
    return null;
  };

  useEffect(() => {
    // Rely on onAuthStateChange to handle initial session detection and subsequent changes.
    // This avoids the "lock stolen" error caused by concurrent getSession calls.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setIsLoading(true);
          // Small buffer to let session locks settle
          await new Promise(r => setTimeout(r, 150));
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            setCurrentUser({ ...profile, email: session.user.email || "" });
            setRoleState(profile.role);
          } else {
            const fallbackUser: AppUser = {
              id: session.user.id,
              name: session.user.user_metadata?.name || "User",
              email: session.user.email || "",
              role: (session.user.user_metadata?.role as UserRole) || "USER",
              avatarInitial: (session.user.user_metadata?.name || "U")[0].toUpperCase(),
              followedTeams: [],
              joinedAt: Date.now(),
            };
            setCurrentUser(fallbackUser);
            setRoleState(fallbackUser.role);
          }
        } else {
          setCurrentUser(null);
          setRoleState("PUBLIC");
        }
      } catch (err) {
        console.error("Auth change error catch:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
      // In a real app, you'd update the DB role here too if allowed
    }
  };

  const registerUser = async (data: { 
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
    role?: UserRole;
  }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role || "USER",
        }
      }
    });

    if (authError) {
      console.error("Sign up error:", authError.message);
      return null;
    }

    if (authData.user) {
      // The profile is created via SQL trigger, but we update extra fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          city: data.city,
          position: data.position,
          height: data.height,
          weight: data.weight,
          pan_card: data.panCard,
          aadhar_card: data.aadharCard,
          photo_url: data.photoUrl,
        })
        .eq('id', authData.user.id);

      if (profileError) console.error("Error updating profile fields:", profileError);

      // If they provided athlete info, also register them in the global pool
      if (data.position && data.height) {
        const { error: athleteError } = await supabase
          .from('athletes')
          .insert([{
            name: data.name,
            email: data.email,
            role: data.position,
            city: data.city,
            height: data.height,
            weight: data.weight,
            pan: data.panCard,
            aadhar: data.aadharCard,
            photo: data.photoUrl,
            status: 'ENABLED',
            kyc_status: 'PENDING'
          }]);
        
        if (athleteError) console.error("Error inserting into global athlete pool:", athleteError);
      }

      const profile = await fetchProfile(authData.user.id);
      return profile;
    }

    return null;
  };

  const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Failsafe: Race the login against a timeout
    const loginPromise = supabase.auth.signInWithPassword({ email, password });
    const timeoutPromise = new Promise<any>(r => 
      setTimeout(() => r({ data: null, error: { message: "Connection Timeout. Please refresh and try again." } }), 4000)
    );

    const { error } = await Promise.race([loginPromise, timeoutPromise]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const updateUser = async (updates: Partial<AppUser>) => {
    if (!currentUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        city: updates.city,
        position: updates.position,
        height: updates.height,
        weight: updates.weight,
        pan_card: updates.panCard,
        aadhar_card: updates.aadharCard,
        photo_url: updates.photoUrl,
        followed_teams: updates.followedTeams,
      })
      .eq('id', currentUser.id);

    if (error) {
      console.error("Update profile error:", error);
      return;
    }

    const profile = await fetchProfile(currentUser.id);
    if (profile) {
      setCurrentUser({ ...profile, email: currentUser.email });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setRoleState("PUBLIC");
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
      isLoading,
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
