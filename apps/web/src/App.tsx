import * as React from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddSiteDialog } from "@/components/add-site-dialog";
import { SiteCard } from "@/components/site-card";
import { api, type SiteWithLatestCheck } from "@/lib/api";
import { statusMeta } from "@/lib/format";

export default function App() {
  const [sites, setSites] = React.useState<SiteWithLatestCheck[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setSites(await api.listSites());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sites");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const upCount = sites.filter((s) => s.latestCheck?.status === "up").length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="size-5" />
            </div>
            <div>
              <h1 className="font-semibold leading-tight">Pulse</h1>
              <p className="text-xs text-muted-foreground">
                Visual uptime monitor
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => load()}>
              <RefreshCw />
            </Button>
            <AddSiteDialog onAdded={load} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {!loading && !error && sites.length > 0 && (
          <p className="mb-6 text-sm text-muted-foreground">
            Monitoring {sites.length} site{sites.length === 1 ? "" : "s"} ·{" "}
            <span className={statusMeta("up").variant === "success" ? "text-emerald-500" : ""}>
              {upCount} up
            </span>
          </p>
        )}

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && sites.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
            <Activity className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No sites yet</p>
              <p className="text-sm text-muted-foreground">
                Add a URL to start monitoring it.
              </p>
            </div>
            <AddSiteDialog onAdded={load} />
          </div>
        )}

        {sites.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onChecked={load}
                onDeleted={load}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
