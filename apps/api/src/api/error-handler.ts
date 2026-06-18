import type { Context } from "hono";

export function handleError(err: Error, c: Context): Response {
  console.error("request failed", { path: c.req.path, error: err.message });
  return c.json({ error: "internal error" }, 500);
}
