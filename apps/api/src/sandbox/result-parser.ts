import { z } from "zod";
import { CheckStatus } from "../types/enums.js";
import type { ScreenshotResult } from "../types/index.js";

const OUTPUT_PREVIEW_LENGTH = 200;

const screenshotOutputSchema = z.object({
  status: z.nativeEnum(CheckStatus),
  statusCode: z.number().nullable(),
  latencyMs: z.number().nullable(),
  screenshotBase64: z.string().nullable(),
  error: z.string().nullable(),
});

export function parseScreenshotResult(
  siteId: string,
  stdout: string,
): ScreenshotResult {
  const trimmed = stdout.trim();
  const start = trimmed.indexOf("{");
  if (start === -1) {
    return {
      siteId,
      status: CheckStatus.Error,
      statusCode: null,
      latencyMs: null,
      screenshotBase64: null,
      error: `no JSON in sandbox output: ${trimmed.slice(0, OUTPUT_PREVIEW_LENGTH)}`,
    };
  }

  const parsed = screenshotOutputSchema.parse(JSON.parse(trimmed.slice(start)));
  return { siteId, ...parsed };
}
