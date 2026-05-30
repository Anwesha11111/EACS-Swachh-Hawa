import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Wind, Eye, EyeOff } from "lucide-react";
import { useAuth, type AuthUser } from "@/lib/auth";

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

/* ── Phone login sub-form ── */
function PhoneForm({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<"number" | "otp">("number");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const { login } = useAuth();

  const sendOtp = () => {
    if (phone.replace(/\D/g, "").length >= 10) setStep("otp");
  };

  const verify = () => {
    if (otp.length === 6) {
      login("phone", { email: `+91 ${phone}` });
      onLogin();
    }
  };

  return (
    <div className="space-y-3">
      {step === "number" ? (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 focus-within:border-primary transition">
            <span className="text-sm text-muted-foreground font-mono">+91</span>
            <input
              type="tel"
              placeholder="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              maxLength={10}
            />
          </div>
          <button
            onClick={sendOtp}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to +91 {phone}</p>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 focus-within:border-primary transition">
            <input
              type={showOtp ? "text" : "password"}
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="flex-1 bg-transparent text-sm font-mono outline-none placeholder:text-muted-foreground tracking-widest"
              maxLength={6}
            />
            <button onClick={() => setShowOtp((v) => !v)} className="text-muted-foreground hover:text-foreground">
              {showOtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={verify}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
          >
            Verify & Sign In
          </button>
          <button onClick={() => setStep("number")} className="w-full text-xs text-muted-foreground hover:text-foreground">
            ← Change number
          </button>
        </>
      )}
    </div>
  );
}

/* ── Main login screen ── */
export function LoginScreen() {
  const { login } = useAuth();
  const [showPhone, setShowPhone] = useState(false);

  const socialLogin = (provider: AuthUser["provider"]) => login(provider);

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
        <div className="mb-8 text-center">
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
          <h2 className="mb-1 text-base font-semibold text-foreground">Sign in to continue</h2>
          <p className="mb-6 text-xs text-muted-foreground">Choose your preferred sign-in method</p>

          {!showPhone ? (
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={() => socialLogin("google")}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => socialLogin("facebook")}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition"
              >
                <FacebookIcon />
                <span>Continue with Facebook</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={() => socialLogin("twitter")}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition"
              >
                <TwitterXIcon />
                <span>Continue with X (Twitter)</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Mobile */}
              <button
                onClick={() => setShowPhone(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition"
              >
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>Continue with Mobile Number</span>
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setShowPhone(false)}
                className="mb-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                ← Back to sign-in options
              </button>
              <PhoneForm onLogin={() => {}} />
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
