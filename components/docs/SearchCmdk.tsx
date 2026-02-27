"use client";
// ============================================================
//  components/docs/SearchCmdk.tsx
//  Paleta de búsqueda tipo ⌘K — busca por título, sección y tags
// ============================================================

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Command as Cmdk } from "cmdk";
import { Search, FileText, X, Hash, FolderOpen } from "lucide-react";
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

  useEffect(() => { setMounted(true); }, []);

  // Abrir con ⌘K o Ctrl+K
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

  const allItems = useMemo(() =>
    index.sections.flatMap((s) =>
      s.items.map((item) => ({ ...item, sectionTitle: s.title }))
    ), [index]);

  // Filtrado manual estricto (sin fuzzy)
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

  const filteredCount = filteredSections.reduce((acc, s) => acc + s.items.length, 0);

  function handleSelect(slug: string) {
    router.push(`/docs/${slug}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      {/* Botón de búsqueda en el navbar */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 text-sm",
          "pl-3 pr-2 py-1.5 rounded-lg",
          "bg-neutral-100 dark:bg-neutral-800",
          "border border-neutral-200 dark:border-neutral-700",
          "text-neutral-500 dark:text-neutral-400",
          "hover:border-neutral-300 dark:hover:border-neutral-600",
          "transition-colors cursor-pointer w-44"
        )}
        aria-label="Buscar documentación"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="text-xs bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded px-1">
          ⌘K
        </kbd>
      </button>

      {/* Modal — renderizado en <body> via portal */}
      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-9999 flex items-start justify-center pt-24 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl mx-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden"
          >
            <Cmdk shouldFilter={false} className="flex flex-col">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                <Search className="h-4 w-4 text-neutral-400 shrink-0" />
                <Cmdk.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Buscar por título, sección o #tag..."
                  className="flex-1 bg-transparent outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                  autoFocus
                />
                {query && (
                  <span className="text-xs text-neutral-400 tabular-nums shrink-0">
                    {filteredCount}
                  </span>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="cursor-pointer text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 ml-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Cmdk.List className="max-h-96 overflow-y-auto p-2">
                <Cmdk.Empty className="py-10 text-center">
                  <p className="text-sm text-neutral-400 mb-1">Sin resultados para &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-neutral-300 dark:text-neutral-600">Prueba con otro título, sección o tag</p>
                </Cmdk.Empty>

                {filteredSections.map((section) => (
                  <Cmdk.Group
                    key={section.title}
                    heading={section.title}
                    className="*:[[cmdk-group-heading]]:text-xs *:[[cmdk-group-heading]]:font-semibold *:[[cmdk-group-heading]]:uppercase *:[[cmdk-group-heading]]:tracking-wider *:[[cmdk-group-heading]]:text-neutral-400 *:[[cmdk-group-heading]]:px-2 *:[[cmdk-group-heading]]:py-1"
                  >
                    {section.items.map((item) => (
                      <Cmdk.Item
                        key={item.slug}
                        value={item.slug}
                        onSelect={() => handleSelect(item.slug)}
                        className={cn(
                          "flex items-start gap-3 px-2 py-2.5 rounded-lg cursor-pointer text-sm",
                          "text-neutral-700 dark:text-neutral-300",
                          "data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-900/30",
                          "data-[selected=true]:text-blue-700 dark:data-[selected=true]:text-blue-300"
                        )}
                      >
                        <FileText className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {/* Sección */}
                            <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                              <FolderOpen className="h-3 w-3" />
                              {section.title}
                            </span>
                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <span className="inline-flex items-center gap-1 flex-wrap">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-0.5 text-xs text-blue-500 dark:text-blue-400"
                                  >
                                    <Hash className="h-2.5 w-2.5" />{tag}
                                  </span>
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                      </Cmdk.Item>
                    ))}
                  </Cmdk.Group>
                ))}
              </Cmdk.List>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs text-neutral-400">
                  {allItems.length} documento{allItems.length !== 1 ? "s" : ""}
                </span>
                <div className="ml-auto flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
                  <span className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-sans text-[10px]">↑↓</kbd>
                    navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-sans text-[10px]">↵</kbd>
                    abrir
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-sans text-[10px]">esc</kbd>
                    cerrar
                  </span>
                </div>
              </div>
            </Cmdk>
          </div>
        </div>
      , document.body)}
    </>
  );
}
