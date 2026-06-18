import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PORT = 4173;
const DIST_DIR = fileURLToPath(new URL("../dist", import.meta.url));
const INDEX_FILE = join(DIST_DIR, "index.html");
const CONTENT_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
]);

function port() {
  const value = Number(process.env.PORT);
  if (value) return value;
  return DEFAULT_PORT;
}

function contentType(path) {
  return CONTENT_TYPES.get(extname(path)) ?? "application/octet-stream";
}

function requestedPath(url) {
  const pathname = new URL(url ?? "/", "http://localhost").pathname;
  const normalized = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  return join(DIST_DIR, normalized);
}

async function filePath(url) {
  const path = requestedPath(url);
  const info = await stat(path).catch(() => null);
  if (info?.isFile()) return path;
  return INDEX_FILE;
}

const server = createServer(async (req, res) => {
  const path = await filePath(req.url);
  res.setHeader("Content-Type", contentType(path));
  createReadStream(path).pipe(res);
});

server.listen(port(), "0.0.0.0", () => {
  console.log(`pulse web listening on :${port()}`);
});
