import { DestroyTimeout } from "@brimble/sandbox";

export const WORK_DIR = "/work";
export const SCRIPT_PATH = `${WORK_DIR}/screenshot.cjs`;
export const PREPARED_MARKER_PATH = `${WORK_DIR}/.pulse-sandbox-ready`;
export const SANDBOX_NAME = "pulse-screenshot-runner";
export const READY_TIMEOUT_MS = 120_000;
export const INSTALL_TIMEOUT_SECONDS = 300;
export const INSTALL_REQUEST_TIMEOUT_MS = INSTALL_TIMEOUT_SECONDS * 1_000;
export const RUN_TIMEOUT_SECONDS = 60;
export const SANDBOX_DESTROY_TIMEOUT = DestroyTimeout.EighteenHours;
export const SANDBOX_PERSISTENT_DISK_GB = 10;
export const SANDBOX_CPU = 2_000;
export const SANDBOX_MEMORY_MB = 2_048;

export const CHROME_DEBIAN_PACKAGES = [
  "ca-certificates",
  "fonts-liberation",
  "libasound2",
  "libatk-bridge2.0-0",
  "libatk1.0-0",
  "libcairo2",
  "libcups2",
  "libdbus-1-3",
  "libdrm2",
  "libexpat1",
  "libfontconfig1",
  "libgbm1",
  "libglib2.0-0",
  "libgtk-3-0",
  "libnspr4",
  "libnss3",
  "libpango-1.0-0",
  "libx11-6",
  "libxcb1",
  "libxcomposite1",
  "libxdamage1",
  "libxext6",
  "libxfixes3",
  "libxkbcommon0",
  "libxrandr2",
  "wget",
  "xdg-utils",
];
