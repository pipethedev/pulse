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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

function url(path: string): string {
  return new URL(path, apiBaseUrl || window.location.origin).toString();
}

async function responseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) return res.json();
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(path), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await responseBody(res);
    if (body && typeof body === "object" && "error" in body) {
      throw new Error(String(body.error));
    }
    throw new Error(`Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new Error("API returned a non-JSON response. Check VITE_API_BASE_URL.");
  }
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
