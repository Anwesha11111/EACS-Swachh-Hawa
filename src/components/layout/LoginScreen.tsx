import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Phone, Wind, Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { DEMO_ACCOUNTS, type DemoAccount } from "@/lib/auth/demo-accounts";

/* ── Social-provider button icons (inline SVGs to avoid extra deps) ── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function TwitterXIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

/* ── Phone login sub-form (real server OTP) ── */
function PhoneForm() {
  const { requestOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<"number" | "otp">("number");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async () => {
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await requestOtp(phone);
    setBusy(false);
    if (res.ok) {
      setStep("otp");
      if (res.demo && res.code) {
        toast("Demo OTP (no SMS provider configured)", {
          description: `Your one-time code is ${res.code}`,
          icon: "🔐",
          duration: 8000,
        });
      }
    } else {
      setError(res.error ?? "Could not send code.");
    }
  };

  const verify = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await verifyOtp(phone, otp);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Invalid code.");
    // On success the app switches automatically.
  };

  return (
    <div className="space-y-3">
      {step === "number" ? (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 focus-within:border-primary transition">
            <span className="text-sm text-muted-foreground font-mono">+91</span>
            <input
              type="tel"
              id="phone-input"
              name="phone"
              placeholder="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              maxLength={10}
            />
          </div>
          <button
            onClick={sendOtp}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Send OTP
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to +91 {phone}</p>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 focus-within:border-primary transition">
            <input
              type={showOtp ? "text" : "password"}
              id="otp-input"
              name="otp"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              className="flex-1 bg-transparent text-sm font-mono outline-none placeholder:text-muted-foreground tracking-widest"
              maxLength={6}
            />
            <button onClick={() => setShowOtp((v) => !v)} className="text-muted-foreground hover:text-foreground">
              {showOtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={verify}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify & Sign In
          </button>
          <button onClick={() => { setStep("number"); setError(null); }} className="w-full text-xs text-muted-foreground hover:text-foreground">
            ← Change number
          </button>
        </>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-[var(--rose)]">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

/* ── Main login screen ── */
export function LoginScreen() {
  const { loginWithPassword } = useAuth();
  const [view, setView] = useState<"main" | "phone">("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showDemos, setShowDemos] = useState(false);

  const submit = async (em = email, pw = password) => {
    if (!em || !pw) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await loginWithPassword(em, pw);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Login failed.");
    // On success the AppShell swaps to the app automatically.
  };

  const quickLogin = (acct: DemoAccount) => {
    setEmail(acct.email);
    setPassword(acct.password);
    submit(acct.email, acct.password);
  };

  // "Demo SSO" — OAuth isn't configured, so these sign in via the real auth
  // path using a demo account. Clearly labelled so it's not mistaken for real SSO.
  const demoSso = (role: DemoAccount["role"]) => {
    const acct = DEMO_ACCOUNTS.find((a) => a.role === role) ?? DEMO_ACCOUNTS[0];
    quickLogin(acct);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 overflow-hidden relative">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[var(--cyan)]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo + branding */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card/80 shadow-lg backdrop-blur-md">
            <Wind className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Swachh Hawa</h1>
          <p className="mt-1 text-sm text-muted-foreground">National Environmental Intelligence Platform</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--emerald)]/30 bg-[var(--emerald)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--emerald)] mono">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--emerald)]" />
            Secure Government Portal
          </div>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
          {view === "main" ? (
            <>
              <h2 className="mb-1 text-base font-semibold text-foreground">Sign in to continue</h2>
              <p className="mb-5 text-xs text-muted-foreground">Enter your credentials to access the platform</p>

              {/* Email + password */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 focus-within:border-primary transition">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    type="email"
                    id="email-input"
                    name="email"
                    placeholder="Email address"
                    value={email}
                    autoComplete="username"
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 focus-within:border-primary transition">
                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    id="password-input"
                    name="password"
                    placeholder="Password"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {error && (
                  <p className="flex items-center gap-1.5 text-[11px] text-[var(--rose)]">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                  </p>
                )}

                <button
                  onClick={() => submit()}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign In
                </button>
              </div>

              {/* Demo accounts */}
              <div className="mt-4 rounded-lg border border-[var(--cyan)]/25 bg-[var(--cyan)]/5 p-3">
                <button
                  onClick={() => setShowDemos((v) => !v)}
                  className="flex w-full items-center justify-between text-[11px] font-semibold text-[var(--cyan)]"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Demo accounts — one-click sign in
                  </span>
                  <span>{showDemos ? "−" : "+"}</span>
                </button>
                {showDemos && (
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                    {DEMO_ACCOUNTS.map((a) => (
                      <button
                        key={a.email}
                        onClick={() => quickLogin(a)}
                        disabled={busy}
                        className="rounded-md border border-border bg-card/70 px-2 py-1.5 text-left transition hover:border-primary/40 disabled:opacity-60"
                      >
                        <div className="text-[11px] font-medium text-foreground">{a.role}</div>
                        <div className="truncate text-[9px] text-muted-foreground mono">{a.password}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Mobile + Demo SSO */}
              <div className="space-y-2.5">
                <button
                  onClick={() => { setView("phone"); setError(null); }}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition"
                >
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>Continue with Mobile Number</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => demoSso("Administrator")}
                    title="OAuth not configured — demo sign-in"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
                  >
                    <GoogleIcon /> <span className="hidden sm:inline">Google</span>
                  </button>
                  <button
                    onClick={() => demoSso("Analyst")}
                    title="OAuth not configured — demo sign-in"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
                  >
                    <FacebookIcon /> <span className="hidden sm:inline">Facebook</span>
                  </button>
                  <button
                    onClick={() => demoSso("Viewer")}
                    title="OAuth not configured — demo sign-in"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
                  >
                    <TwitterXIcon /> <span className="hidden sm:inline">X</span>
                  </button>
                </div>
                <p className="text-center text-[10px] text-muted-foreground">
                  Social buttons are <span className="font-semibold">demo sign-in</span> — real OAuth activates when provider keys are configured.
                </p>
              </div>
            </>
          ) : (
            <div>
              <h2 className="mb-4 text-base font-semibold text-foreground">Sign in with mobile</h2>
              <button
                onClick={() => { setView("main"); setError(null); }}
                className="mb-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                ← Back to sign-in options
              </button>
              <PhoneForm />
            </div>
          )}

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            By signing in you agree to the{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-foreground">Terms of Use</span>
            {" & "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-foreground">Privacy Policy</span>
            {" "}of the Swachh Hawa platform.
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Authorised access only · Ministry of Environment, Forest and Climate Change
        </p>
      </motion.div>
    </div>
  );
}
