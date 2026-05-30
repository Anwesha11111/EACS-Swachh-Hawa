import { createContext, useContext, useState, type ReactNode } from "react";

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  role: string;
  provider: "google" | "facebook" | "twitter" | "phone";
  avatar?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (provider: AuthUser["provider"], overrides?: Partial<AuthUser>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

const MOCK_USERS: Record<AuthUser["provider"], AuthUser> = {
  google:   { name: "Priya Sharma",   email: "priya.sharma@gmail.com",  initials: "PS", role: "Administrator",  provider: "google" },
  facebook: { name: "Arjun Mehta",    email: "arjun.mehta@outlook.com", initials: "AM", role: "Analyst",        provider: "facebook" },
  twitter:  { name: "Neha Gupta",     email: "neha.gupta@x.com",        initials: "NG", role: "Viewer",         provider: "twitter" },
  phone:    { name: "Rajesh Kumar",   email: "+91 98765 43210",          initials: "RK", role: "Field Officer",  provider: "phone" },
};

function readStored(): AuthUser | null {
  try {
    const s = localStorage.getItem("sh-auth-user");
    return s ? (JSON.parse(s) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStored);

  const login = (provider: AuthUser["provider"], overrides?: Partial<AuthUser>) => {
    const u: AuthUser = { ...MOCK_USERS[provider], ...overrides };
    setUser(u);
    localStorage.setItem("sh-auth-user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sh-auth-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
