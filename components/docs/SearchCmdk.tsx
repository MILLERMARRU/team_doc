"use client";
// ============================================================
//  components/docs/SearchCmdk.tsx
//  Paleta de búsqueda tipo ⌘K usando cmdk
// ============================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, FileText, X } from "lucide-react";
import type { DocsIndex } from "@/types";
import { cn } from "@/lib/utils";

interface SearchCmdkProps {
  index: DocsIndex;
}

export default function SearchCmdk({ index }: SearchCmdkProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

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

  const allItems = index.sections.flatMap((s) =>
    s.items.map((item) => ({ ...item, sectionTitle: s.title }))
  );

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

      {/* Modal del Command Palette */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl mx-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden"
          >
            <Command shouldFilter={true} className="flex flex-col">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                <Search className="h-4 w-4 text-neutral-400 shrink-0" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Buscar en la documentación..."
                  className="flex-1 bg-transparent outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                  autoFocus
                />
                <button
                  onClick={() => setOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-neutral-400">
                  Sin resultados para &ldquo;{query}&rdquo;
                </Command.Empty>

                {index.sections.map((section) => (
                  <Command.Group
                    key={section.title}
                    heading={section.title}
                    className="[&>[cmdk-group-heading]]:text-xs [&>[cmdk-group-heading]]:font-semibold [&>[cmdk-group-heading]]:uppercase [&>[cmdk-group-heading]]:tracking-wider [&>[cmdk-group-heading]]:text-neutral-400 [&>[cmdk-group-heading]]:px-2 [&>[cmdk-group-heading]]:py-1"
                  >
                    {section.items.map((item) => (
                      <Command.Item
                        key={item.slug}
                        value={`${item.title} ${item.tags?.join(" ") ?? ""} ${section.title}`}
                        onSelect={() => handleSelect(item.slug)}
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer text-sm",
                          "text-neutral-700 dark:text-neutral-300",
                          "data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-900/30",
                          "data-[selected=true]:text-blue-700 dark:data-[selected=true]:text-blue-300"
                        )}
                      >
                        <FileText className="h-4 w-4 shrink-0 text-neutral-400" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-neutral-400 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1">
                            {item.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center gap-3 px-4 py-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs text-neutral-400">
                  {allItems.length} documento{allItems.length !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-neutral-300 dark:text-neutral-600 ml-auto">
                  ↑↓ navegar · ↵ abrir · esc cerrar
                </span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
