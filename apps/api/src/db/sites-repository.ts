import { pool } from "./pool.js";
import { toSite, type SiteRow } from "./mappers.js";
import { requireRow } from "./query-results.js";
import type { Site, CheckTarget } from "../types/index.js";

export async function createSite(url: string): Promise<Site> {
  const { rows } = await pool.query<SiteRow>(
    `INSERT INTO sites (url) VALUES ($1)
     RETURNING id, url, created_at`,
    [url],
  );
  return toSite(requireRow(rows));
}

export async function listSites(): Promise<Site[]> {
  const { rows } = await pool.query<SiteRow>(
    `SELECT id, url, created_at FROM sites ORDER BY created_at DESC`,
  );
  return rows.map(toSite);
}

export async function getSite(id: string): Promise<Site | null> {
  const { rows } = await pool.query<SiteRow>(
    `SELECT id, url, created_at FROM sites WHERE id = $1`,
    [id],
  );
  const row = rows[0];
  return row ? toSite(row) : null;
}

export async function deleteSite(id: string): Promise<Site | null> {
  const { rows } = await pool.query<SiteRow>(
    `DELETE FROM sites WHERE id = $1
     RETURNING id, url, created_at`,
    [id],
  );
  const row = rows[0];
  return row ? toSite(row) : null;
}

export async function listCheckTargets(): Promise<CheckTarget[]> {
  const { rows } = await pool.query<{ id: string; url: string }>(
    `SELECT id, url FROM sites ORDER BY created_at ASC`,
  );
  return rows.map((r) => ({ siteId: r.id, url: r.url }));
}
