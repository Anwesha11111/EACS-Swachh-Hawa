import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, UserPlus, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { downloadCsv } from "@/lib/export";
import { InviteUserModal } from "@/components/modals/InviteUserModal";
import { inviteUser } from "@/lib/api";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "User Roles · Swachh Hawa" }] }),
  component: Page,
});

const USER_LIST = [
  { name: "Amit Verma", email: "a.verma@cpcb.gov.in", role: "Platform Admin", tier: "Federal", status: "Active", lastLogin: "2026-05-30T05:44Z", mfa: true },
  { name: "Insp. R. Sharma", email: "r.sharma@cpcb.gov.in", role: "CPCB Enforcement Officer", tier: "Federal", status: "Active", lastLogin: "2026-05-30T05:48Z", mfa: true },
  { name: "Insp. K. Mehta", email: "k.mehta@cpcb.gov.in", role: "CPCB Enforcement Officer", tier: "Federal", status: "Active", lastLogin: "2026-05-30T04:22Z", mfa: true },
  { name: "Dr. P. Iyer", email: "p.iyer@iitd.ac.in", role: "Research Analyst", tier: "Institutional", status: "Active", lastLogin: "2026-05-29T22:10Z", mfa: false },
  { name: "S. Kumari", email: "s.kumari@dmc.delhi.gov.in", role: "City Dashboard User", tier: "City", status: "Active", lastLogin: "2026-05-29T18:04Z", mfa: false },
  { name: "Insp. A. Singh (SPCB)", email: "a.singh@spcb.punjab.gov.in", role: "SPCB State Officer", tier: "State", status: "Active", lastLogin: "2026-05-30T01:33Z", mfa: true },
  { name: "Legacy Account", email: "old@example.com", role: "City Dashboard User", tier: "City", status: "Suspended", lastLogin: "2026-02-11T09:00Z", mfa: false },
];

const ROLE_DIST = [
  { role: "Citizen", count: 48210, color: "var(--chart-1)" },
  { role: "City User", count: 842, color: "var(--cyan)" },
  { role: "Research", count: 312, color: "var(--primary)" },
  { role: "SPCB Officer", count: 84, color: "var(--amber)" },
  { role: "CPCB Officer", count: 28, color: "var(--rose)" },
  { role: "Admin", count: 4, color: "var(--chart-2)" },
];

export default function Page() {
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const filtered = useMemo(() =>
    search
      ? USER_LIST.filter(u =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase())
        )
      : USER_LIST,
    [search]
  );

  const handleInviteUser = () => {
    setShowInviteModal(true);
  };

  const handleExportUsers = () => {
    downloadCsv(
      filtered.map(u => ({
        Name: u.name, Email: u.email, Role: u.role,
        Tier: u.tier, MFA: u.mfa ? "Yes" : "No",
        Status: u.status, "Last Login": u.lastLogin,
      })),
      `users-export-${new Date().toISOString().slice(0,10)}.csv`
    );
    toast.success(`Exported ${filtered.length} users as CSV`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ADMIN · User Roles"
        title="User Management & Role Assignment"
        description="Federated user directory across CPCB, SPCB state boards, municipal bodies, research institutions, and citizen portal. Role assignments enforced by DisclosurePolicy ACL."
        actions={
          <div className="flex gap-2">
            <button onClick={handleExportUsers} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50">
              Export CSV
            </button>
            <button onClick={handleInviteUser} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
              <UserPlus className="h-3.5 w-3.5" /> Invite User
            </button>
          </div>
        }
      />

      <InviteUserModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onSuccess={() => {
          setShowInviteModal(false);
        }}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Total Users", v: "49,480", c: "primary" },
          { l: "Active Today", v: "1,284", c: "emerald" },
          { l: "MFA Enabled", v: "78%", c: "cyan" },
          { l: "Suspended", v: "12", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <Panel title="User Directory" subtitle="Privileged users shown — citizen accounts managed via self-service portal" dense>
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <div className="flex items-center gap-2 rounded border border-border bg-background/50 px-2 py-1 text-xs flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or role…"
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
            <tr className="border-b border-border">
              {["Name","Email","Role","Tier","MFA","Last Login","Status"].map(h => (
                <th key={h} className="px-4 py-2 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr
                key={u.email}
                className="border-b border-border/40 hover:bg-accent/40 cursor-pointer"
                onClick={() => toast.info(`${u.name}`, {
                  description: `${u.role} · ${u.tier} · MFA: ${u.mfa ? "Enabled" : "Disabled"} · Last login: ${u.lastLogin.replace("T", " ").replace("Z", " UTC")}`,
                })}
              >
                <td className="px-4 py-2.5 font-medium">{u.name}</td>
                <td className="px-4 py-2.5 mono text-[10px] text-muted-foreground">{u.email}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.role}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded px-1.5 py-0.5 text-[10px] mono" style={{
                    background: u.tier === "Federal" ? "color-mix(in oklab,var(--primary) 16%,transparent)" : "color-mix(in oklab,var(--muted-foreground) 12%,transparent)",
                    color: u.tier === "Federal" ? "var(--primary)" : "var(--muted-foreground)",
                  }}>{u.tier}</span>
                </td>
                <td className="px-4 py-2.5 mono" style={{ color: u.mfa ? "var(--emerald)" : "var(--amber)" }}>
                  {u.mfa ? "✓ On" : "Off"}
                </td>
                <td className="px-4 py-2.5 mono text-[10px] text-muted-foreground whitespace-nowrap">{u.lastLogin.replace("T", " ").replace("Z", " UTC")}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: u.status === "Active" ? "color-mix(in oklab,var(--emerald) 16%,transparent)" : "color-mix(in oklab,var(--amber) 16%,transparent)",
                      color: u.status === "Active" ? "var(--emerald)" : "var(--amber)",
                    }}>{u.status}</span>
                    {u.status === "Suspended" && (
                      <button
                        onClick={e => { e.stopPropagation(); toast.success(`${u.name} reinstated`, { description: "Account reactivated. User will receive an email notification." }); }}
                        className="text-[10px] text-primary hover:underline"
                      >
                        Reinstate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="User Distribution by Role" subtitle="Citizen accounts dominate — privileged roles are tightly controlled">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ROLE_DIST} margin={{ top: 4, right: 16, bottom: 20, left: 0 }}>
              <XAxis dataKey="role" tick={{ fontSize: 9, fontFamily: "monospace" }} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), "users"]} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {ROLE_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
