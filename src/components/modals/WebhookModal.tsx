import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createWebhook, deleteWebhook, Webhook } from "@/lib/api/settings.functions";

interface WebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  existingWebhooks: Webhook[];
  onSuccess?: () => void;
}

const WEBHOOK_EVENTS = [
  { id: "incident_created", label: "Incident Created" },
  { id: "incident_resolved", label: "Incident Resolved" },
  { id: "aqi_threshold_breach", label: "AQI Threshold Breach" },
  { id: "sensor_offline", label: "Sensor Offline" },
  { id: "user_invited", label: "User Invited" },
  { id: "report_completed", label: "Report Completed" },
];

export function WebhookModal({ open, onOpenChange, userEmail, existingWebhooks, onSuccess }: WebhookModalProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["incident_created"]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!webhookUrl.trim()) {
      toast.error("Webhook URL is required");
      return;
    }

    // Basic URL validation
    try {
      new URL(webhookUrl);
    } catch {
      toast.error("Invalid webhook URL");
      return;
    }

    if (selectedEvents.length === 0) {
      toast.error("Select at least one event");
      return;
    }

    setLoading(true);
    try {
      const result = await createWebhook({
        data: {
          userEmail,
          webhook_url: webhookUrl,
          trigger_events: selectedEvents,
        },
      });

      toast.success("Webhook Created", {
        description: `Webhook ${result.webhook_id} created successfully.`,
      });

      // Reset form
      setWebhookUrl("");
      setSelectedEvents(["incident_created"]);
      onSuccess?.();
    } catch (err) {
      toast.error("Error creating webhook", {
        description: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm("Delete this webhook? It cannot be recovered.")) return;

    setDeleting(webhookId);
    try {
      await deleteWebhook({
        data: {
          userEmail,
          webhook_id: webhookId,
        },
      });

      toast.success("Webhook Deleted");
      onSuccess?.();
    } catch (err) {
      toast.error("Error deleting webhook", {
        description: String(err),
      });
    } finally {
      setDeleting(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((events) =>
      events.includes(eventId)
        ? events.filter((e) => e !== eventId)
        : [...events, eventId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Webhook Management</DialogTitle>
          <DialogDescription>
            Create webhooks to receive real-time events from the system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Webhooks */}
          {existingWebhooks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Active Webhooks</h3>
              <div className="space-y-2">
                {existingWebhooks.map((webhook) => (
                  <div
                    key={webhook.webhook_id}
                    className="flex items-start justify-between rounded-lg border border-border bg-background/50 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium mono text-muted-foreground break-all">
                        {webhook.url}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        Events: {webhook.events.join(", ")}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Created: {new Date(webhook.created_at).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWebhook(webhook.webhook_id)}
                      disabled={deleting === webhook.webhook_id}
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      {deleting === webhook.webhook_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Webhook */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold">Add New Webhook</h3>

            <form onSubmit={handleAddWebhook} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL *</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  placeholder="https://example.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be a valid HTTPS URL. We'll POST JSON events to this endpoint.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Events to Subscribe *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {WEBHOOK_EVENTS.map((event) => (
                    <div key={event.id} className="flex items-center">
                      <input
                        id={event.id}
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => toggleEvent(event.id)}
                        disabled={loading}
                        className="h-4 w-4 rounded border-border"
                      />
                      <Label
                        htmlFor={event.id}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {event.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Close
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? "Creating..." : "Add Webhook"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
