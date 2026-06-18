import { runScreenshotBatch } from "../sandbox/runner.js";
import { screenshotKey, uploadScreenshot } from "../storage/screenshots.js";
import { insertCheck } from "../db/checks-repository.js";
import { listCheckTargets } from "../db/sites-repository.js";
import type { Check, CheckTarget, ScreenshotResult } from "../types/index.js";

async function persistResult(result: ScreenshotResult): Promise<Check> {
  let key: string | null = null;

  if (result.screenshotBase64) {
    key = screenshotKey(result.siteId, new Date());
    await uploadScreenshot(key, Buffer.from(result.screenshotBase64, "base64"));
  }

  return insertCheck({
    siteId: result.siteId,
    status: result.status,
    statusCode: result.statusCode,
    latencyMs: result.latencyMs,
    screenshotKey: key,
  });
}

export async function runChecks(targets: CheckTarget[]): Promise<Check[]> {
  const results = await runScreenshotBatch(targets);
  return Promise.all(results.map(persistResult));
}

export async function runChecksForAllSites(): Promise<Check[]> {
  const targets = await listCheckTargets();
  return runChecks(targets);
}
