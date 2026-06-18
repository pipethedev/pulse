import type { ExecResult } from "@brimble/sandbox";
import { CheckStatus } from "../types/enums.js";
import type { ScreenshotResult } from "../types/index.js";

const EXEC_OUTPUT_PREVIEW_LENGTH = 500;

export function formatExecError(command: string, result: ExecResult): string {
  const output = result.stderr.trim() || result.stdout.trim();
  if (!output) return `${command} exited with code ${result.exit_code}`;
  return `${command} exited with code ${result.exit_code}: ${output.slice(0, EXEC_OUTPUT_PREVIEW_LENGTH)}`;
}

export function ensureExecSucceeded(command: string, result: ExecResult): void {
  if (result.exit_code === 0) return;
  throw new Error(formatExecError(command, result));
}

export function failedScreenshotResult(
  siteId: string,
  command: string,
  result: ExecResult,
): ScreenshotResult {
  return {
    siteId,
    status: CheckStatus.Error,
    statusCode: null,
    latencyMs: null,
    screenshotBase64: null,
    error: formatExecError(command, result),
  };
}
