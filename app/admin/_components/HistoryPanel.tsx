"use client";
// ============================================================
//  app/admin/_components/HistoryPanel.tsx
//  Modal: historial de commits de un doc + diff + restaurar.
// ============================================================

import { useEffect, useState } from "react";
import { GitCommitHorizontal, History, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CommitSummary } from "@/lib/github";
import type { DocItem } from "@/types";

interface HistoryPanelProps {
  item: DocItem;
  onClose: () => void;
  onRestored: () => void;
}

export default function HistoryPanel({ item, onClose, onRestored }: HistoryPanelProps) {
  const [commits, setCommits] = useState<CommitSummary[] | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedSha, setSelectedSha] = useState<string | null>(null);
  const [diff, setDiff] = useState<{ patch: string | null; status: string } | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCommits() {
      setLoadingList(true);
      setListError(null);
      try {
        const res = await fetch(`/api/docs/history?slug=${encodeURIComponent(item.slug)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al cargar el historial");
        if (!cancelled) setCommits(data.commits);
      } catch (err) {
        if (!cancelled) {
          setListError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }
    loadCommits();
    return () => {
      cancelled = true;
    };
  }, [item.slug]);

  async function handleSelectCommit(sha: string) {
    setSelectedSha(sha);
    setDiff(null);
    setLoadingDiff(true);
    try {
      const res = await fetch(
        `/api/docs/history/diff?slug=${encodeURIComponent(item.slug)}&sha=${sha}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar el diff");
      setDiff(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar el diff");
    } finally {
      setLoadingDiff(false);
    }
  }

  async function handleRestore(sha: string) {
    setRestoring(sha);
    try {
      const res = await fetch("/api/docs/history/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: item.slug, sha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo restaurar");

      toast.success(`"${item.title}" restaurado a la versión ${sha.slice(0, 7)}`);
      onRestored();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setRestoring(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-3xl max-h-[85vh] flex-col rounded-xl border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4" />
            Historial de &quot;{item.title}&quot;
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 overflow-hidden sm:grid-cols-[220px_1fr]">
          {/* ── Lista de commits ── */}
          <div className="overflow-y-auto border-b sm:border-b-0 sm:border-r">
            {loadingList && (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
              </div>
            )}
            {listError && <p className="p-4 text-sm text-red-500">{listError}</p>}
            {!loadingList && !listError && commits?.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">Sin historial todavía.</p>
            )}
            {commits?.map((c) => (
              <button
                key={c.sha}
                type="button"
                onClick={() => handleSelectCommit(c.sha)}
                className={`flex w-full flex-col items-start gap-0.5 border-b px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                  selectedSha === c.sha ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <span className="flex items-center gap-1 font-mono text-muted-foreground">
                  <GitCommitHorizontal className="h-3 w-3" />
                  {c.sha.slice(0, 7)}
                </span>
                <span className="line-clamp-2 font-medium">{c.message.split("\n")[0]}</span>
                <span className="text-muted-foreground">
                  {c.authorName} · {new Date(c.date).toLocaleString()}
                </span>
              </button>
            ))}
          </div>

          {/* ── Diff del commit seleccionado ── */}
          <div className="overflow-y-auto p-4">
            {!selectedSha && (
              <p className="text-sm text-muted-foreground">
                Elegí un commit de la izquierda para ver el diff.
              </p>
            )}
            {selectedSha && loadingDiff && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando diff...
              </div>
            )}
            {selectedSha && !loadingDiff && diff && (
              <div className="space-y-3">
                {diff.patch ? (
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono leading-relaxed">
                    {diff.patch.split("\n").map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.startsWith("+") && !line.startsWith("+++")
                            ? "bg-green-500/15 text-green-700 dark:text-green-400"
                            : line.startsWith("-") && !line.startsWith("---")
                              ? "bg-red-500/15 text-red-700 dark:text-red-400"
                              : "text-muted-foreground"
                        }
                      >
                        {line}
                      </div>
                    ))}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin diff textual disponible para este commit ({diff.status}).
                  </p>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  disabled={!!restoring}
                  onClick={() => handleRestore(selectedSha)}
                >
                  {restoring === selectedSha ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  Restaurar esta versión
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
