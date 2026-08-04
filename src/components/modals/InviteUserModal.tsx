import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { inviteUser } from "@/lib/api/users.functions";

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InviteUserModal({ open, onOpenChange, onSuccess }: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"officer" | "admin" | "citizen">("citizen");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ email: string; token: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await inviteUser({
        data: {
          email,
          role,
        },
      });

      if (response.invitation_sent) {
        setResult({
          email,
          token: response.invitation_token,
          expiresAt: response.expires_at,
        });

        toast.success("Invitation sent", {
          description: `Invitation sent to ${email}. Valid for 48 hours.`,
        });
      }
    } catch (err) {
      toast.error("Error sending invitation", {
        description: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (result?.token) {
      navigator.clipboard.writeText(result.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Token copied to clipboard");
    }
  };

  const handleReset = () => {
    setEmail("");
    setRole("citizen");
    setResult(null);
    setCopied(false);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            {result
              ? "Share this invitation token with the user"
              : "Send an invitation to a new user to join the system"}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                disabled={loading}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="citizen">Citizen</option>
                <option value="officer">Enforcement Officer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-sm font-medium text-emerald-900">Invitation Ready</p>
              <p className="text-sm text-emerald-800 mt-1">
                Invitation link valid until {new Date(result.expiresAt).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Invitation Token</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={result.token}
                  readOnly
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-muted-foreground"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToken}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Share Instructions</Label>
              <p className="text-sm text-muted-foreground">
                Share this token with {result.email} along with the invite link.
                They can use it to create their account.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleReset}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Invitation for ${result.email}\n\nToken: ${result.token}\n\nExpires: ${new Date(result.expiresAt).toLocaleString("en-IN")}`
                  );
                  toast.success("Invitation details copied");
                }}
              >
                Copy All Details
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
