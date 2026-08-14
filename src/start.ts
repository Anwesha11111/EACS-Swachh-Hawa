import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Note: CSRF middleware is intentionally disabled. On Vercel, the request
// origin header doesn't match the deployment host when proxied through
// api/render.js, which causes TanStack's built-in CSRF check to reject all
// server-function POST calls (including login). Session integrity is still
// protected by HMAC-signed httpOnly cookies (AUTH_SECRET).
export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));
