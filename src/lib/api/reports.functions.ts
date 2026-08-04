import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

// ═════════════════════════════════════════════════════════════════════════════
// Reports & Data Export Functions
// ═════════════════════════════════════════════════════════════════════════════

export interface ReportJob {
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  estimated_time_seconds: number;
}

/**
 * Generate a custom report with background processing
 * Input: {report_type, date_range, cities[], format}
 * Output: {job_id, status: 'processing', estimated_time_seconds}
 * Creates a background job and returns job_id for polling
 */
export const generateReport = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    report_type: z.enum(
      ["aqi_summary", "incidents", "enforcement", "compliance"],
      { errorMap: () => ({ message: "Invalid report type" }) }
    ),
    date_range: z.object({
      start_date: z.string().datetime(),
      end_date: z.string().datetime(),
    }),
    cities: z.array(z.string()).min(1, "At least one city is required"),
    format: z.enum(["csv", "pdf", "json"], {
      errorMap: () => ({ message: "Format must be: csv, pdf, or json" }),
    }),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    const job_id = `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const created_at = new Date().toISOString();
    
    // Estimate processing time based on report type
    const estimationMap: Record<string, number> = {
      aqi_summary: 15,
      incidents: 30,
      enforcement: 45,
      compliance: 60,
    };
    const estimated_time_seconds = estimationMap[input.report_type] || 30;

    if (!db) {
      console.log("[reports/demo] Would generate report:", input);
      return {
        job_id,
        status: "processing" as const,
        estimated_time_seconds,
        source: "demo" as const,
      };
    }

    try {
      // Create async job record
      const { error: insertError } = await db
        .from("async_tasks")
        .insert({
          id: job_id,
          task_type: "report_generation",
          status: "processing",
          input_data: input,
          result_data: null,
          error_message: null,
          created_at,
          started_at: created_at,
          completed_at: null,
          estimated_completion_time: new Date(
            Date.now() + estimated_time_seconds * 1000
          ).toISOString(),
        });

      if (insertError) throw insertError;

      // Log to audit_log
      try {
        await db.from("audit_log").insert({
          action: "report_generated",
          entity_type: "async_task",
          entity_id: job_id,
          details: {
            report_type: input.report_type,
            cities: input.cities,
            format: input.format,
          },
          created_at,
        });
      } catch (auditErr) {
        console.warn("[reports] Audit log error:", auditErr);
      }

      return {
        job_id,
        status: "processing" as const,
        estimated_time_seconds,
        source: "database" as const,
      };
    } catch (err) {
      console.error("[reports] Generate error:", err);
      throw new Error(`Failed to generate report: ${String(err)}`);
    }
  });

/**
 * Get report job status and result
 */
export const getReportStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    job_id: z.string(),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return {
        job_id: input.job_id,
        status: "processing" as const,
        progress: 50,
        result: null,
        error: null,
        source: "mock" as const,
      };
    }

    try {
      const { data, error } = await db
        .from("async_tasks")
        .select("*")
        .eq("id", input.job_id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          job_id: input.job_id,
          status: "not_found" as const,
          progress: 0,
          result: null,
          error: "Job not found",
          source: "database" as const,
        };
      }

      return {
        job_id: input.job_id,
        status: data.status,
        progress: data.status === "completed" ? 100 : data.status === "processing" ? 50 : 0,
        result: data.result_data,
        error: data.error_message,
        source: "database" as const,
      };
    } catch (err) {
      console.error("[reports] Status fetch error:", err);
      throw new Error("Failed to fetch report status");
    }
  });

/**
 * Download completed report
 */
export const downloadReport = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    job_id: z.string(),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return {
        success: false,
        error: "No backend configured",
        source: "mock" as const,
      };
    }

    try {
      const { data, error } = await db
        .from("async_tasks")
        .select("*")
        .eq("id", input.job_id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          success: false,
          error: "Report not found",
          source: "database" as const,
        };
      }

      if (data.status !== "completed") {
        return {
          success: false,
          error: `Report is ${data.status}, not ready for download`,
          source: "database" as const,
        };
      }

      return {
        success: true,
        report_url: `/api/reports/download/${input.job_id}`,
        format: data.input_data?.format || "csv",
        source: "database" as const,
      };
    } catch (err) {
      console.error("[reports] Download error:", err);
      throw new Error("Failed to download report");
    }
  });

/**
 * List user's generated reports
 */
export const listUserReports = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userEmail: z.string().email(),
    limit: z.number().min(1).max(100).default(20),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return {
        reports: [],
        total: 0,
        source: "mock" as const,
      };
    }

    try {
      const { data, error, count } = await db
        .from("async_tasks")
        .select("*", { count: "exact" })
        .eq("created_by", input.userEmail)
        .eq("task_type", "report_generation")
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (error) throw error;

      return {
        reports: data || [],
        total: count || 0,
        source: "database" as const,
      };
    } catch (err) {
      console.error("[reports] List error:", err);
      throw new Error("Failed to list reports");
    }
  });
