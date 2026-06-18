export type CheckStatus = "up" | "down" | "error";

export interface Check {
  id: string;
  siteId: string;
  status: CheckStatus;
  statusCode: number | null;
  latencyMs: number | null;
  screenshotKey: string | null;
  checkedAt: string;
}

export interface SiteWithLatestCheck {
  id: string;
  url: string;
  createdAt: string;
  latestCheck: Check | null;
  screenshotUrl: string | null;
}

export interface SiteDetail extends SiteWithLatestCheck {
  checks: Check[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listSites: () => request<SiteWithLatestCheck[]>("/sites"),
  getSite: (id: string) => request<SiteDetail>(`/sites/${id}`),
  addSite: (url: string) =>
    request<SiteWithLatestCheck>("/sites", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),
  runCheck: (id: string) =>
    request<Check>(`/sites/${id}/check`, { method: "POST" }),
  deleteSite: (id: string) =>
    request<void>(`/sites/${id}`, { method: "DELETE" }),
};
