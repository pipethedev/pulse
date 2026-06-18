import { Sandbox, SandboxStatus } from "@brimble/sandbox";
import { config } from "../config/index.js";
import { SANDBOX_SCREENSHOT_SCRIPT } from "./screenshot-script.js";
import {
  CHROME_DEBIAN_PACKAGES,
  INSTALL_REQUEST_TIMEOUT_MS,
  INSTALL_TIMEOUT_SECONDS,
  PREPARED_MARKER_PATH,
  READY_TIMEOUT_MS,
  SANDBOX_CPU,
  SANDBOX_DESTROY_TIMEOUT,
  SANDBOX_MEMORY_MB,
  SANDBOX_NAME,
  SANDBOX_PERSISTENT_DISK_GB,
  SCRIPT_PATH,
  WORK_DIR,
} from "./constants.js";
import { ensureExecSucceeded } from "./exec-result.js";

const client = new Sandbox({ apiKey: config.BRIMBLE_SANDBOX_KEY });

export type SandboxHandle = Awaited<
  ReturnType<typeof client.sandboxes.createReady>
>;

let preparedSandbox: Promise<SandboxHandle> | null = null;

async function findReusableSandbox(): Promise<SandboxHandle | null> {
  const sandboxes = await client.sandboxes.list({ limit: 100 });
  const existing = sandboxes.data.find((sandbox) => {
    return (
      sandbox.data.name === SANDBOX_NAME &&
      sandbox.status !== SandboxStatus.Destroyed &&
      sandbox.status !== SandboxStatus.Failed
    );
  });
  if (!existing) return null;

  return client.sandboxes.getReady(existing.id, {
    wait: { timeoutMs: READY_TIMEOUT_MS, pollIntervalMs: 2_000 },
  });
}

async function createSandbox(): Promise<SandboxHandle> {
  return client.sandboxes.createReady(
    {
      name: SANDBOX_NAME,
      region: config.SANDBOX_REGION,
      template: config.SANDBOX_TEMPLATE,
      specs: { cpu: SANDBOX_CPU, memory: SANDBOX_MEMORY_MB },
      autoDestroy: true,
      destroyTimeout: SANDBOX_DESTROY_TIMEOUT,
      persistent: true,
      persistentDiskGB: SANDBOX_PERSISTENT_DISK_GB,
    },
    { wait: { timeoutMs: READY_TIMEOUT_MS, pollIntervalMs: 2_000 } },
  );
}

function installCommand(): string {
  const packages = CHROME_DEBIAN_PACKAGES.join(" ");
  return [
    "apt-get update >/dev/null",
    `apt-get install -y --no-install-recommends ${packages} >/dev/null`,
    `cd ${WORK_DIR}`,
    "npm init -y >/dev/null",
    "npm install puppeteer >/dev/null",
    `touch ${PREPARED_MARKER_PATH}`,
  ].join(" && ");
}

async function prepareSandbox(handle: SandboxHandle): Promise<SandboxHandle> {
  const markerCheckCommand = `test -f ${PREPARED_MARKER_PATH}`;
  const markerCheck = await handle.exec({ cmd: markerCheckCommand });
  if (markerCheck.exit_code === 0) return handle;

  const makeWorkDirCommand = `mkdir -p ${WORK_DIR}`;
  const makeWorkDir = await handle.exec({ cmd: makeWorkDirCommand });
  ensureExecSucceeded(makeWorkDirCommand, makeWorkDir);

  await handle.putFile(SCRIPT_PATH, Buffer.from(SANDBOX_SCREENSHOT_SCRIPT));

  const command = installCommand();
  const install = await handle.exec(
    {
      cmd: command,
      timeout_seconds: INSTALL_TIMEOUT_SECONDS,
    },
    { timeoutMs: INSTALL_REQUEST_TIMEOUT_MS },
  );
  ensureExecSucceeded(command, install);

  return handle;
}

export async function getPreparedSandbox(): Promise<SandboxHandle> {
  preparedSandbox ??= (async () => {
    const reusable = await findReusableSandbox();
    const handle = reusable ?? (await createSandbox());
    return prepareSandbox(handle);
  })();

  try {
    return await preparedSandbox;
  } catch (error) {
    preparedSandbox = null;
    throw error;
  }
}
