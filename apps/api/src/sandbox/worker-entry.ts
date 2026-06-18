import { runChecksForAllSites } from "../api/check-service.js";
import { SandboxMode } from "../types/enums.js";
import { workerConfig } from "./worker-config.js";

const MINUTE_MS = 60_000;

async function tick(): Promise<void> {
  const checks = await runChecksForAllSites();
  console.log(`ran ${checks.length} checks`);
}

async function main(): Promise<void> {
  if (workerConfig.SANDBOX_MODE === SandboxMode.OneShot) {
    await tick();
    return;
  }

  console.log(
    `interval mode: every ${workerConfig.CHECK_INTERVAL_MINUTES}m`,
  );
  await tick();
  setInterval(() => {
    void tick().catch((err) => console.error("tick failed", err));
  }, workerConfig.CHECK_INTERVAL_MINUTES * MINUTE_MS);
}

main();
