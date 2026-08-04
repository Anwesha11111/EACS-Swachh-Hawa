// ═════════════════════════════════════════════════════════════════════════════
// API Request Logger & Error Handler
// Logs all API requests, tracks performance, and handles errors gracefully
// ═════════════════════════════════════════════════════════════════════════════

import { getSupabaseAdmin } from "../supabase.server";

interface ApiLog {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  user_agent: string | null;
  ip_address: string | null;
  error_message: string | null;
}

/**
 * Log API request to console and optionally to database
 */
async function logRequest(log: ApiLog): Promise<void> {
  // Console logging
  const emoji = log.status >= 500 ? "❌" : log.status >= 400 ? "⚠️" : "✅";
  const statusColor = log.status >= 500 ? "\x1b[31m" : log.status >= 400 ? "\x1b[33m" : "\x1b[32m";
  const reset = "\x1b[0m";
  
  console.log(
    `${emoji} ${statusColor}${log.status}${reset} ${log.method} ${log.path} ${log.duration_ms}ms`
  );

  if (log.error_message) {
    console.error(`   Error: ${log.error_message}`);
  }

  // Optionally log to database audit table
  try {
    const db = await getSupabaseAdmin();
    if (db) {
      await db.from("audit_log").insert({
        timestamp: log.timestamp,
        action: `${log.method} ${log.path}`,
        resource_type: "api_request",
        actor_ip: log.ip_address,
        status: log.status >= 400 ? "failure" : "success",
        error_message: log.error_message,
        details: {
          duration_ms: log.duration_ms,
          user_agent: log.user_agent,
        },
      });
    }
  } catch (err) {
    // Ignore logging errors to prevent cascade failures
    console.error("Failed to log to database:", err);
  }
}

/**
 * API Logger middleware
 * Wraps handlers to log requests and track performance
 */
export function withApiLogger(
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    const startTime = Date.now();
    const url = new URL(request.url);
    
    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;

      await logRequest({
        timestamp: new Date().toISOString(),
        method: request.method,
        path: url.pathname,
        status: response.status,
        duration_ms: duration,
        user_agent: request.headers.get("user-agent"),
        ip_address: request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") ||
                     null,
        error_message: null,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await logRequest({
        timestamp: new Date().toISOString(),
        method: request.method,
        path: url.pathname,
        status: 500,
        duration_ms: duration,
        user_agent: request.headers.get("user-agent"),
        ip_address: request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") ||
                     null,
        error_message: errorMessage,
      });

      // Return structured error response
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: process.env.NODE_ENV === "development" ? errorMessage : "An unexpected error occurred",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  };
}

/**
 * Error handler for server functions
 * Provides consistent error responses
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Error handler middleware
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap unknown errors
      throw new ApiError(
        error instanceof Error ? error.message : "An unexpected error occurred",
        500,
        "INTERNAL_ERROR"
      );
    }
  }) as T;
}

/**
 * Validation error helper
 */
export function validationError(message: string, details?: any): never {
  throw new ApiError(message, 400, "VALIDATION_ERROR", details);
}

/**
 * Not found error helper
 */
export function notFoundError(resource: string): never {
  throw new ApiError(`${resource} not found`, 404, "NOT_FOUND");
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(message: string = "Unauthorized"): never {
  throw new ApiError(message, 401, "UNAUTHORIZED");
}

/**
 * Forbidden error helper
 */
export function forbiddenError(message: string = "Forbidden"): never {
  throw new ApiError(message, 403, "FORBIDDEN");
}
