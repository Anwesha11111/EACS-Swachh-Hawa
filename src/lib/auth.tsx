import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

import {
  loginWithPassword as loginPwFn,
  requestOtp as requestOtpFn,
  verifyOtp as verifyOtpFn,
  getSession,
  logoutFn,
} from "./api/auth.functions";
import type { AuthUser, Role } from "./auth-roles";
import { roleAtLeast } from "./auth-roles";

// Re-export so existing imports (`import { type AuthUser } from "@/lib/auth"`)
// keep working.
export type { AuthUser, Role } from "./auth-roles";

interface LoginResult {
  ok: boolean;
  error?: string;
}
interface OtpRequestResult {
  ok: boolean;
  demo?: boolean;
  code?: string;
  error?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  /** True until the initial session check resolves. */
  loading: boolean;
  isAuthenticated: boolean;
  loginWithPassword: (email: string, password: string) => Promise<LoginResult>;
  requestOtp: (phone: string) => Promise<OtpRequestResult>;
  verifyOtp: (phone: string, otp: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  /** Role check helper for conditional UI. */
  hasRole: (min: Role) => boolean;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  isAuthenticated: false,
  loginWithPassword: async () => ({ ok: false }),
  requestOtp: async () => ({ ok: false }),
  verifyOtp: async () => ({ ok: false }),
  logout: async () => {},
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate the httpOnly session cookie on mount (server-side check).
  useEffect(() => {
    let cancelled = false;
    getSession()
      .then((res) => {
        if (!cancelled) setUser(res.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithPassword = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await loginPwFn({ data: { email, password } });
      if (res.ok) {
        setUser(res.user);
        return { ok: true };
      }
      return { ok: false, error: res.error };
    } catch {
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  }, []);

  const requestOtp = useCallback(async (phone: string): Promise<OtpRequestResult> => {
    try {
      return await requestOtpFn({ data: { phone } });
    } catch {
      return { ok: false, error: "Could not send code. Please try again." };
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string): Promise<LoginResult> => {
    try {
      const res = await verifyOtpFn({ data: { phone, otp } });
      if (res.ok) {
        setUser(res.user);
        return { ok: true };
      }
      return { ok: false, error: res.error };
    } catch {
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutFn();
    } finally {
      setUser(null);
    }
  }, []);

  const hasRole = useCallback((min: Role) => roleAtLeast(user?.role, min), [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        loginWithPassword,
        requestOtp,
        verifyOtp,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
