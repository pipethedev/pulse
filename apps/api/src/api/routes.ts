import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createSiteSchema } from "./schemas.js";
import { withLatestCheck } from "./site-view.js";
import { runChecks } from "./check-service.js";
import {
  createSite,
  deleteSite,
  getSite,
  listSites,
} from "../db/sites-repository.js";
import { listChecksForSite } from "../db/checks-repository.js";

const CHECK_HISTORY_LIMIT = 50;

export const routes = new Hono();

routes.get("/", (c) => c.json({ status: "ok", message: "app is running" }));
routes.get("/health", (c) => c.json({ status: "ok" }));

routes.post("/sites", zValidator("json", createSiteSchema), async (c) => {
  const { url } = c.req.valid("json");
  const site = await createSite(url);
  return c.json(site, 201);
});

routes.get("/sites", async (c) => {
  const sites = await listSites();
  const enriched = await Promise.all(sites.map(withLatestCheck));
  return c.json(enriched);
});

routes.get("/sites/:id", async (c) => {
  const site = await getSite(c.req.param("id"));
  if (!site) return c.json({ error: "site not found" }, 404);

  const checks = await listChecksForSite(site.id, CHECK_HISTORY_LIMIT);
  return c.json({ ...(await withLatestCheck(site)), checks });
});

routes.delete("/sites/:id", async (c) => {
  const site = await deleteSite(c.req.param("id"));
  if (!site) return c.json({ error: "site not found" }, 404);

  return c.body(null, 204);
});

routes.post("/sites/:id/check", async (c) => {
  const site = await getSite(c.req.param("id"));
  if (!site) return c.json({ error: "site not found" }, 404);

  const [check] = await runChecks([{ siteId: site.id, url: site.url }]);
  return c.json(check, 201);
});
