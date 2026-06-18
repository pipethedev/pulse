import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { allowedCorsOrigins } from "./config/cors.js";
import { config } from "./config/index.js";
import { routes } from "./api/routes.js";
import { handleError } from "./api/error-handler.js";

const app = new Hono();
const corsOrigins = allowedCorsOrigins(config.CORS_ORIGINS);

app.use(
  "*",
  cors({
    origin: corsOrigins,
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);

app.use("*", async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store");
});

app.route("/", routes);
app.onError(handleError);

serve({ fetch: app.fetch, port: config.PORT }, (info) => {
  console.log(`pulse api listening on :${info.port}`);
});
