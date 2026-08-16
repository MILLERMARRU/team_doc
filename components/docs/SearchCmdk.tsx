"use client";
// ============================================================
//  components/docs/SearchCmdk.tsx
//  Paleta ⌘K — estilo Next.js docs
//  · Sin query  → lista plana de secciones (Docker, React…)
//  · Con query  → sección como padre + docs hijos indentados
// ============================================================

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Command as Cmdk } from "cmdk";
import { Search, FileText, AlignLeft } from "lucide-react";
import type { DocsIndex } from "@/types";
import { cn } from "@/lib/utils";

interface SearchCmdkProps {
  index: DocsIndex;
}

export default function SearchCmdk({ index }: SearchCmdkProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Evitar hydration mismatch: no hay sistema externo que sincronizar,
  // solo necesitamos distinguir el primer render (servidor) del cliente.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  // Secciones filtradas según el query
  const filteredSections = useMemo(() => {
    if (!query.trim()) return index.sections;
    const q = query.toLowerCase();
    return index.sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            section.title.toLowerCase().includes(q) ||
            item.tags?.some((t) => t.toLowerCase().includes(q)) ||
            item.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [query, index.sections]);

  function navigate(slug: string) {
    router.push(`/docs/${slug}`);
    setOpen(false);
    setQuery("");
  }

  const isSearching = query.trim().length > 0;

  return (
    <>
      {/* ── Botón del navbar ── */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 text-sm pl-3 pr-2 py-1.5 rounded-lg cursor-pointer w-44",
          "bg-neutral-100 dark:bg-neutral-800",
          "border border-neutral-200 dark:border-neutral-700",
          "text-neutral-500 dark:text-neutral-400",
          "hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
        )}
        aria-label="Buscar documentación"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="text-xs bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded px-1">
          ⌘K
        </kbd>
      </button>

      {/* ── Modal ── */}
      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-9999 flex items-start justify-center pt-[10vh] bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl mx-4 bg-white dark:bg-[#111] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
          >
            <Cmdk shouldFilter={false} className="flex flex-col">

              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <Cmdk.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="What are you searching for?"
                  className="flex-1 bg-transparent outline-none text-[15px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  autoFocus
                />
                <button
                  onClick={() => setOpen(false)}
                  className="cursor-pointer text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  <kbd className="text-[11px] border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded px-1.5 py-0.5">
                    Esc
                  </kbd>
                </button>
              </div>

              {/* Lista */}
              <Cmdk.List className="max-h-105 overflow-y-auto py-1">
                <Cmdk.Empty className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  No results for &ldquo;{query}&rdquo;
                </Cmdk.Empty>

                {!isSearching
                  // ── ESTADO INICIAL: lista plana de secciones ──
                  ? index.sections.map((section) => (
                    <Cmdk.Item
                      key={section.title}
                      value={section.title}
                      onSelect={() => {
                        const first = section.items[0];
                        if (first) navigate(first.slug);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 cursor-pointer",
                        "text-neutral-800 dark:text-neutral-200 text-[14px]",
                        "data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-800",
                        "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                      )}
                    >
                      <FileText className="h-4.5 w-4.5 shrink-0 text-neutral-400 dark:text-neutral-400" />
                      <span>{section.title}</span>
                    </Cmdk.Item>
                  ))

                  // ── CON QUERY: sección padre + docs hijos ──
                  : filteredSections.map((section) => (
                    <div key={section.title}>
                      {/* Encabezado de sección (no seleccionable, solo visual) */}
                      <div className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-neutral-800 dark:text-neutral-200">
                        <FileText className="h-4.5 w-4.5 shrink-0 text-neutral-400" />
                        <span>{section.title}</span>
                      </div>

                      {/* Línea vertical + docs hijos */}
                      <div className="ml-[1.65rem] border-l border-neutral-200 dark:border-neutral-700">
                        {section.items.map((item) => (
                          <Cmdk.Item
                            key={item.slug}
                            value={`${section.title} ${item.title}`}
                            onSelect={() => navigate(item.slug)}
                            className={cn(
                              "flex items-center gap-3 pl-6 pr-4 py-2.5 cursor-pointer",
                              "text-neutral-600 dark:text-neutral-300 text-[13px]",
                              "data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-800",
                              "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                            )}
                          >
                            <AlignLeft className="h-3.5 w-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                            <span className="truncate">{item.title}</span>
                          </Cmdk.Item>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </Cmdk.List>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3 text-[11px] text-neutral-400 dark:text-neutral-500">
                  <span className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center h-5 px-1 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-[10px]">↑↓</kbd>
                    navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center h-5 px-1 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-[10px]">↵</kbd>
                    abrir
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-[10px]">esc</kbd>
                    cerrar
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                  {index.sections.reduce((a, s) => a + s.items.length, 0)} docs
                </span>
              </div>

            </Cmdk>
          </div>
        </div>
      , document.body)}
    </>
  );
}
