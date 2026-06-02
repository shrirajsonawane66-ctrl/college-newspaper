"use client";

import { createContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { getProfile, ensureProfile, type Profile } from "@/lib/auth";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileCache = useRef<Map<string, Profile>>(new Map());

  const fetchAndSetProfile = useCallback(async (userId: string, email: string) => {
    const cached = profileCache.current.get(userId);
    if (cached) {
      setProfile(cached);
      return cached;
    }
    const p = await ensureProfile(userId, email);
    if (p) profileCache.current.set(userId, p);
    setProfile(p);
    return p;
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);

      if (s?.user) {
        fetchAndSetProfile(s.user.id, s.user.email || "");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!mounted) return;
        setSession(s);
        setUser(s?.user ?? null);

        if (s?.user) {
          fetchAndSetProfile(s.user.id, s.user.email || "");
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchAndSetProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    profileCache.current.clear();
  }, []);

  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isLoading, isAdmin, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
