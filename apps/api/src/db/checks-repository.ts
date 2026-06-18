import { pool } from "./pool.js";
import { toCheck, type CheckRow } from "./mappers.js";
import { requireRow } from "./query-results.js";
import type { Check } from "../types/index.js";
import type { CheckStatus } from "../types/enums.js";

export interface NewCheck {
  siteId: string;
  status: CheckStatus;
  statusCode: number | null;
  latencyMs: number | null;
  screenshotKey: string | null;
}

export async function insertCheck(check: NewCheck): Promise<Check> {
  const { rows } = await pool.query<CheckRow>(
    `INSERT INTO checks (site_id, status, status_code, latency_ms, screenshot_key)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, site_id, status, status_code, latency_ms, screenshot_key, checked_at`,
    [
      check.siteId,
      check.status,
      check.statusCode,
      check.latencyMs,
      check.screenshotKey,
    ],
  );
  return toCheck(requireRow(rows));
}

export async function listChecksForSite(
  siteId: string,
  limit: number,
): Promise<Check[]> {
  const { rows } = await pool.query<CheckRow>(
    `SELECT id, site_id, status, status_code, latency_ms, screenshot_key, checked_at
     FROM checks WHERE site_id = $1
     ORDER BY checked_at DESC LIMIT $2`,
    [siteId, limit],
  );
  return rows.map(toCheck);
}

export async function getLatestCheckForSite(
  siteId: string,
): Promise<Check | null> {
  const rows = await listChecksForSite(siteId, 1);
  return rows[0] ?? null;
}
