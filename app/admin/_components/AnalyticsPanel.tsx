"use client";
// ============================================================
//  app/admin/_components/AnalyticsPanel.tsx
//  Dashboard de vistas por doc (Upstash Redis vía /api/admin/analytics).
// ============================================================

import { useEffect, useState } from "react";
import { BarChart3, Eye, EyeOff, Loader2 } from "lucide-react";
import type { DocsIndex } from "@/types";

interface AnalyticsPanelProps {
  index: DocsIndex;
}

interface DocWithViews {
  slug: string;
  title: string;
  section: string;
  views: number;
}

export default function AnalyticsPanel({ index }: AnalyticsPanelProps) {
  const [views, setViews] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/analytics");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al cargar analytics");
        if (!cancelled) setViews(data.views);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando analytics...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  const allDocs: DocWithViews[] = index.sections.flatMap((section) =>
    section.items.map((item) => ({
      slug: item.slug,
      title: item.title,
      section: section.title,
      views: views?.[item.slug] ?? 0,
    }))
  );

  const visited = allDocs.filter((d) => d.views > 0).sort((a, b) => b.views - a.views);
  const unvisited = allDocs.filter((d) => d.views === 0);
  const totalViews = allDocs.reduce((acc, d) => acc + d.views, 0);

  return (
    <div className="space-y-4">
      {/* ── Resumen ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Vistas totales</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalViews}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Docs con vistas</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{visited.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Docs sin visitas</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{unvisited.length}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* ── Más leídos ── */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
              Más leídos
            </h2>
          </div>

          {visited.length === 0 && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Todavía no hay vistas registradas.
            </p>
          )}

          <ul className="space-y-2">
            {visited.slice(0, 10).map((doc) => (
              <li
                key={doc.slug}
                className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {doc.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{doc.section}</p>
                </div>
                <span className="flex items-center gap-1 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <Eye className="h-3.5 w-3.5" />
                  {doc.views}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Sin visitas ── */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400">
              <EyeOff className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
              Docs sin visitas
            </h2>
          </div>

          {unvisited.length === 0 && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Todos los docs tienen al menos una vista. 🎉
            </p>
          )}

          <ul className="space-y-2">
            {unvisited.map((doc) => (
              <li
                key={doc.slug}
                className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {doc.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{doc.section}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
