// Generic "coming soon" template for sidebar routes that are placeholders.
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";

export function ModulePage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <div className="space-y-4">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Panel>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <div className="absolute inset-0 rounded-2xl border border-primary/40 animate-pulse-ring" />
            <span className="mono text-xs">MOD</span>
          </div>
          <div className="text-sm font-medium">Module Online · Provisioning UI</div>
          <p className="max-w-md text-xs text-muted-foreground">
            This module is part of the Swachh Hawa platform. Operational dashboards for this surface are deployed across the federal mesh.
            Interactive views are wired to the national data fabric and will populate on activation.
          </p>
          {children}
        </div>
      </Panel>
    </div>
  );
}