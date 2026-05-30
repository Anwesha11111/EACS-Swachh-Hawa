import { motion } from "framer-motion";
import { ALERTS } from "@/lib/mock-data";
import { AlertTriangle } from "lucide-react";

export function AlertFeed() {
  return (
    <ul className="divide-y divide-border/60">
      {ALERTS.map((a, i) => (
        <motion.li
          key={a.ts}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-start gap-3 px-4 py-2.5 hover:bg-accent/40"
        >
          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded bg-[var(--rose)]/15 text-[var(--rose)]">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] mono text-muted-foreground">
              <span>{a.ts}</span>
              <span className="rounded bg-muted px-1.5 text-[10px]">{a.code}</span>
              <span>· {a.region}</span>
            </div>
            <div className="truncate text-sm">{a.msg}</div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}