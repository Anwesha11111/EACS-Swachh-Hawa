import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getReportStatus, downloadReport } from "@/lib/api/reports.functions";

interface ReportProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  estimatedSeconds: number;
}

export function ReportProgressDialog({
  open,
  onOpenChange,
  jobId,
  estimatedSeconds,
}: ReportProgressDialogProps) {
  const [status, setStatus] = useState<"processing" | "completed" | "failed">("processing");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || status !== "processing") return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await getReportStatus({ data: { job_id: jobId } });

        if (result.status === "completed") {
          setStatus("completed");
          setProgress(100);
          clearInterval(pollInterval);

          // Get the download URL
          try {
            const downloadResult = await downloadReport({ data: { job_id: jobId } });
            if (downloadResult.success && downloadResult.report_url) {
              setDownloadUrl(downloadResult.report_url);
            }
          } catch (err) {
            console.error("Error getting download URL:", err);
          }
        } else if (result.status === "failed") {
          setStatus("failed");
          setError(result.error || "Report generation failed");
          clearInterval(pollInterval);
        } else {
          // Update progress based on estimated time
          const elapsed = Date.now() / 1000 - (window as any).__reportStartTime || 0;
          const newProgress = Math.min(95, (elapsed / estimatedSeconds) * 100);
          setProgress(newProgress);
        }
      } catch (err) {
        console.error("Error polling report status:", err);
        setStatus("failed");
        setError("Failed to check report status");
        clearInterval(pollInterval);
      }
    }, 2000);

    // Store start time
    (window as any).__reportStartTime = Date.now() / 1000;

    return () => clearInterval(pollInterval);
  }, [open, jobId, estimatedSeconds, status]);

  const handleDownload = async () => {
    if (!downloadUrl) return;

    setDownloading(true);
    try {
      // Trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `report-${jobId}.pdf`;
      link.click();

      toast.success("Report downloaded");
      onOpenChange(false);
    } catch (err) {
      toast.error("Error downloading report", {
        description: String(err),
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Report Generation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {status === "processing" && (
            <>
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Generating report...</span>
                  <span className="font-mono font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Estimated completion: {Math.round(estimatedSeconds - (progress / 100) * estimatedSeconds)}s
                </p>
              </div>
            </>
          )}

          {status === "completed" && (
            <>
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-emerald-600" />
              </div>

              <div className="space-y-2 text-center">
                <p className="font-semibold">Report Ready</p>
                <p className="text-sm text-muted-foreground">
                  Your custom report has been generated successfully.
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={jobId}
                  readOnly
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-mono text-muted-foreground"
                />
              </div>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-rose-600" />
              </div>

              <div className="space-y-2 text-center">
                <p className="font-semibold">Report Generation Failed</p>
                <p className="text-sm text-muted-foreground">
                  {error || "An error occurred while generating the report."}
                </p>
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end">
            {status === "completed" && downloadUrl && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button type="button" onClick={handleDownload} disabled={downloading}>
                  {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {downloading ? "Downloading..." : "Download"}
                </Button>
              </>
            )}
            {status === "failed" && (
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            )}
            {status === "processing" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Keep Processing in Background
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
