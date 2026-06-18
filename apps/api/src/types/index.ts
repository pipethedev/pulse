import type { CheckStatus } from "./enums.js";

export interface Site {
  id: string;
  url: string;
  createdAt: string;
}

export interface Check {
  id: string;
  siteId: string;
  status: CheckStatus;
  statusCode: number | null;
  latencyMs: number | null;
  screenshotKey: string | null;
  checkedAt: string;
}

export interface SiteWithLatestCheck extends Site {
  latestCheck: Check | null;
  screenshotUrl: string | null;
}

export interface ScreenshotResult {
  siteId: string;
  status: CheckStatus;
  statusCode: number | null;
  latencyMs: number | null;
  screenshotBase64: string | null;
  error: string | null;
}

export interface CheckTarget {
  siteId: string;
  url: string;
}
