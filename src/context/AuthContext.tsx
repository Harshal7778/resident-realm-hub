import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { hasPermission } from "@/lib/permissions";
import { authService } from "@/services/authService";
import { ensureSeeded } from "@/services/memberService";
import { permissionService } from "@/services/permissionService";
import { USERS_EVENT } from "@/services/userService";
import type { Permission, Role, Session, User } from "@/types/domain";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isReady: boolean;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  hasRole: (roles: Role[]) => boolean;
  setSession: (session: Session) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [isReady, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
    setSessionState(authService.getSession());
    setReady(true);
  }, []);

  // Permission or role edits apply immediately, without a reload.
  useEffect(() => {
    const refresh = () => {
      setSessionState(authService.getSession());
      setVersion((v) => v + 1);
    };
    const unsubscribe = permissionService.subscribe(refresh);
    if (typeof window !== "undefined") window.addEventListener(USERS_EVENT, refresh);
    return () => {
      unsubscribe();
      if (typeof window !== "undefined") window.removeEventListener(USERS_EVENT, refresh);
    };
  }, []);

  const setSession = useCallback((next: Session) => setSessionState(next), []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSessionState(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const permissions = user ? permissionService.effectiveFor(user.role) : [];
    return {
      user,
      session,
      isAuthenticated: !!user,
      isReady,
      permissions,
      can: (permission) => (user ? hasPermission(user.role, permission, permissions) : false),
      hasRole: (roles) => (user ? roles.includes(user.role) : false),
      setSession,
      logout,
    };
    // `version` forces a recompute when stored permissions change.
  }, [session, isReady, setSession, logout, version]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
