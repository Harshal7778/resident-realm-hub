import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { hasPermission } from "@/lib/permissions";
import { authService } from "@/services/authService";
import { ensureSeeded } from "@/services/memberService";
import type { Permission, Role, Session, User } from "@/types/domain";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isReady: boolean;
  can: (permission: Permission) => boolean;
  hasRole: (roles: Role[]) => boolean;
  setSession: (session: Session) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    ensureSeeded();
    setSessionState(authService.getSession());
    setReady(true);
  }, []);

  const setSession = useCallback((next: Session) => setSessionState(next), []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSessionState(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      user,
      session,
      isAuthenticated: !!user,
      isReady,
      can: (permission) => (user ? hasPermission(user.role, permission) : false),
      hasRole: (roles) => (user ? roles.includes(user.role) : false),
      setSession,
      logout,
    };
  }, [session, isReady, setSession, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
