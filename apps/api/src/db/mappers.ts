import type { Check, Site } from "../types/index.js";
import { toCheckStatus, toNullableNumber } from "./row-parsers.js";

export interface SiteRow {
  id: string;
  url: string;
  created_at: Date;
}

export interface CheckRow {
  id: string;
  site_id: string;
  status: string;
  status_code: number | string | null;
  latency_ms: number | string | null;
  screenshot_key: string | null;
  checked_at: Date;
}

export function toSite(row: SiteRow): Site {
  return {
    id: row.id,
    url: row.url,
    createdAt: row.created_at.toISOString(),
  };
}

export function toCheck(row: CheckRow): Check {
  return {
    id: row.id,
    siteId: row.site_id,
    status: toCheckStatus(row.status),
    statusCode: toNullableNumber(row.status_code),
    latencyMs: toNullableNumber(row.latency_ms),
    screenshotKey: row.screenshot_key,
    checkedAt: row.checked_at.toISOString(),
  };
}
