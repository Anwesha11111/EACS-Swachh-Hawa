import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createIncident } from "@/lib/api/incidents.functions";

interface NewIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewIncidentModal({ open, onOpenChange, onSuccess }: NewIncidentModalProps) {
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"Critical" | "High" | "Medium" | "Low">("High");
  const [locationDesc, setLocationDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!type.trim()) {
      toast.error("Incident type is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!locationDesc.trim()) {
      toast.error("Location description is required");
      return;
    }

    setLoading(true);
    try {
      const result = await createIncident({
        data: {
          city,
          type,
          description,
          severity,
          location_desc: locationDesc,
        },
      });

      toast.success("Incident Created", {
        description: `Case ${result.id} created and added to enforcement pipeline.`,
      });

      // Reset form
      setCity("");
      setType("");
      setDescription("");
      setSeverity("High");
      setLocationDesc("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error("Error creating incident", {
        description: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Manual Incident Case</DialogTitle>
          <DialogDescription>
            File a new enforcement case by providing location, type, and description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Delhi, Mumbai, Bangalore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Incident Type *</Label>
            <Input
              id="type"
              placeholder="e.g., Industrial Emission, Vehicular PM Spike, Construction Dust"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity *</Label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationDesc">Location Description *</Label>
            <Input
              id="locationDesc"
              placeholder="e.g., Wazirpur Industrial Area, Western Express Highway"
              value={locationDesc}
              onChange={(e) => setLocationDesc(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              placeholder="Detailed description of the incident and evidence"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[100px]"
            />
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
              {loading ? "Creating..." : "Create Case"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
