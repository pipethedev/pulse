import { RUN_TIMEOUT_SECONDS, SCRIPT_PATH, WORK_DIR } from "./constants.js";
import { failedScreenshotResult } from "./exec-result.js";
import { parseScreenshotResult } from "./result-parser.js";
import { getPreparedSandbox } from "./sandbox-manager.js";
import type { CheckTarget, ScreenshotResult } from "../types/index.js";

export async function runScreenshotBatch(
  targets: CheckTarget[],
): Promise<ScreenshotResult[]> {
  if (targets.length === 0) return [];

  const handle = await getPreparedSandbox();
  const results: ScreenshotResult[] = [];
  for (const target of targets) {
    const screenshotCommand = `node ${SCRIPT_PATH}`;
    const run = await handle.exec({
      cmd: screenshotCommand,
      cwd: WORK_DIR,
      timeout_seconds: RUN_TIMEOUT_SECONDS,
      env: { TARGET_URL: target.url },
    });
    if (run.exit_code !== 0) {
      results.push(failedScreenshotResult(target.siteId, screenshotCommand, run));
      continue;
    }
    results.push(parseScreenshotResult(target.siteId, run.stdout));
  }
  return results;
}
