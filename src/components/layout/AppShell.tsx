import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { motion, AnimatePresence } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import { Wind, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { minRoleForPath, roleAtLeast } from "@/lib/auth-roles";
import { LoginScreen } from "./LoginScreen";

function AuthSplash() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card/80 shadow-lg">
        <Wind className="h-7 w-7 text-primary" />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Verifying session…
      </div>
    </div>
  );
}

function InsufficientPermissions({ pathname }: { pathname: string }) {
  const { user } = useAuth();
  const needed = minRoleForPath(pathname);
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--rose)]/30 bg-[var(--rose)]/10">
        <ShieldAlert className="h-7 w-7 text-[var(--rose)]" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">Insufficient permissions</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        This area requires the <span className="font-semibold text-foreground">{needed}</span> role.
        You are signed in as <span className="font-semibold text-foreground">{user?.role}</span>.
      </p>
      <p className="mt-3 text-[11px] text-muted-foreground mono">
        Contact an administrator to request elevated access.
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <AuthSplash />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const minRole = minRoleForPath(pathname);
  const blocked = minRole ? !roleAtLeast(user?.role, minRole) : false;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <TopBar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="relative flex-1 overflow-y-auto scrollbar-thin">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-[var(--cyan)]/10 blur-3xl" />
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative flex min-h-full flex-col p-4"
            >
              {blocked ? <InsufficientPermissions pathname={pathname} /> : children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
