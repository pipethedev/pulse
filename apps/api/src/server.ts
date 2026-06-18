import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "./config/index.js";
import { routes } from "./api/routes.js";
import { handleError } from "./api/error-handler.js";

const app = new Hono();

app.route("/", routes);
app.onError(handleError);

serve({ fetch: app.fetch, port: config.PORT }, (info) => {
  console.log(`pulse api listening on :${info.port}`);
});
