import * as React from "react";
import { toast } from "sonner";
import { RefreshCw, ExternalLink, ImageOff, Maximize2, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api, type SiteWithLatestCheck } from "@/lib/api";
import { hostname, relativeTime, statusMeta } from "@/lib/format";

export function SiteCard({
  site,
  onChecked,
  onDeleted,
}: {
  site: SiteWithLatestCheck;
  onChecked: () => void;
  onDeleted: () => void;
}) {
  const [checking, setChecking] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const check = site.latestCheck;

  async function runCheck() {
    setChecking(true);
    try {
      const result = await api.runCheck(site.id);
      toast.success(`${hostname(site.url)} is ${statusMeta(result.status).label.toLowerCase()}`);
      onChecked();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check failed");
    } finally {
      setChecking(false);
    }
  }

  async function deleteSite() {
    setDeleting(true);
    try {
      await api.deleteSite(site.id);
      toast.success(`Removed ${hostname(site.url)}`);
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete site");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video border-b bg-muted">
        {site.screenshotUrl ? (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="group/preview block size-full cursor-zoom-in"
                aria-label={`Preview screenshot of ${hostname(site.url)}`}
              >
                <img
                  src={site.screenshotUrl}
                  alt={`Screenshot of ${hostname(site.url)}`}
                  className="size-full object-cover object-top"
                  loading="lazy"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors duration-200 group-hover/preview:bg-black/40 group-hover/preview:opacity-100">
                  <Maximize2 className="size-6 text-white drop-shadow" />
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl overflow-hidden p-0">
              <DialogTitle className="sr-only">
                Screenshot of {hostname(site.url)}
              </DialogTitle>
              <img
                src={site.screenshotUrl}
                alt={`Screenshot of ${hostname(site.url)}`}
                className="max-h-[85vh] w-full object-contain"
              />
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-6" />
            <span className="text-xs">No screenshot yet</span>
          </div>
        )}
        {check && (
          <div className="pointer-events-none absolute right-3 top-3">
            <Badge variant={statusMeta(check.status).variant}>
              {statusMeta(check.status).label}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="pt-5">
        <a
          href={site.url}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-1.5 font-medium hover:underline"
        >
          {hostname(site.url)}
          <ExternalLink className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </a>

        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <Stat label="Status code" value={check?.statusCode ?? "—"} />
          <Stat
            label="Latency"
            value={check?.latencyMs != null ? `${check.latencyMs} ms` : "—"}
          />
          <Stat
            label="Checked"
            value={check ? relativeTime(check.checkedAt) : "never"}
          />
        </dl>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={runCheck}
          disabled={checking || deleting}
        >
          <RefreshCw className={checking ? "animate-spin" : undefined} />
          {checking ? "Checking…" : "Check now"}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              disabled={deleting}
              aria-label={`Delete ${hostname(site.url)}`}
            >
              <Trash2 />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete site?</DialogTitle>
              <DialogDescription>
                This removes <span className="font-medium">{hostname(site.url)}</span>{" "}
                and its entire check history. This can’t be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSite}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
