import { getLatestCheckForSite } from "../db/checks-repository.js";
import { screenshotUrl } from "../storage/screenshots.js";
import type { Site, SiteWithLatestCheck } from "../types/index.js";

export async function withLatestCheck(
  site: Site,
): Promise<SiteWithLatestCheck> {
  const latestCheck = await getLatestCheckForSite(site.id);
  return {
    ...site,
    latestCheck,
    screenshotUrl: screenshotUrl(latestCheck?.screenshotKey ?? null),
  };
}
