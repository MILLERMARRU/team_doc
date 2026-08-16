"use client";
// ============================================================
//  app/admin/_components/HistoryPanel.tsx
//  Modal: historial de commits de un doc + diff + restaurar.
// ============================================================

import { useEffect, useState } from "react";
import { GitCommitHorizontal, History, Loader2, RotateCcw, X } from "lucide-react";
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
      <div className="flex w-full max-w-3xl max-h-[85vh] flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400">
              <History className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
              Historial de &quot;{item.title}&quot;
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 overflow-hidden sm:grid-cols-[240px_1fr]">
          {/* ── Lista de commits ── */}
          <div className="overflow-y-auto border-b sm:border-b-0 sm:border-r border-neutral-200 dark:border-neutral-800">
            {loadingList && (
              <div className="flex items-center gap-2 p-4 text-sm text-neutral-500 dark:text-neutral-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
              </div>
            )}
            {listError && <p className="p-4 text-sm text-red-500">{listError}</p>}
            {!loadingList && !listError && commits?.length === 0 && (
              <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                Sin historial todavía.
              </p>
            )}
            {commits?.map((c) => (
              <button
                key={c.sha}
                type="button"
                onClick={() => handleSelectCommit(c.sha)}
                className={`flex w-full flex-col items-start gap-0.5 border-b border-neutral-100 dark:border-neutral-800/60 px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                  selectedSha === c.sha
                    ? "bg-blue-50/60 dark:bg-blue-900/10 border-l-2 border-l-blue-500"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                }`}
              >
                <span className="flex items-center gap-1 font-mono text-neutral-500 dark:text-neutral-400">
                  <GitCommitHorizontal className="h-3 w-3" />
                  {c.sha.slice(0, 7)}
                </span>
                <span className="line-clamp-2 font-medium text-neutral-900 dark:text-neutral-100">
                  {c.message.split("\n")[0]}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {c.authorName} · {new Date(c.date).toLocaleString()}
                </span>
              </button>
            ))}
          </div>

          {/* ── Diff del commit seleccionado ── */}
          <div className="overflow-y-auto p-4">
            {!selectedSha && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Elegí un commit de la izquierda para ver el diff.
              </p>
            )}
            {selectedSha && loadingDiff && (
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando diff...
              </div>
            )}
            {selectedSha && !loadingDiff && diff && (
              <div className="space-y-3">
                {diff.patch ? (
                  <pre className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-3 text-xs font-mono leading-relaxed">
                    {diff.patch.split("\n").map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.startsWith("+") && !line.startsWith("+++")
                            ? "bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400"
                            : line.startsWith("-") && !line.startsWith("---")
                              ? "bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400"
                              : "text-neutral-500 dark:text-neutral-400"
                        }
                      >
                        {line}
                      </div>
                    ))}
                  </pre>
                ) : (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Sin diff textual disponible para este commit ({diff.status}).
                  </p>
                )}

                <button
                  type="button"
                  disabled={!!restoring}
                  onClick={() => handleRestore(selectedSha)}
                  className="inline-flex items-center gap-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-semibold rounded-lg px-4 py-2 border border-neutral-200 dark:border-neutral-700 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {restoring === selectedSha ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  Restaurar esta versión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
