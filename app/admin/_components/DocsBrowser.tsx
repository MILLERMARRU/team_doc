"use client";
// ============================================================
//  app/admin/_components/DocsBrowser.tsx
//  Explorador de documentos: visualiza, edita y elimina .md
// ============================================================

import { useState } from "react";
import {
  Search, X, FileSearch, FolderOpen, FileText,
  ChevronDown, ChevronRight, Hash, Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { DocsIndex, DocItem } from "@/types";

interface DocsBrowserProps {
  index: DocsIndex;
  onEditRequest: (item: DocItem, content: string) => void;
}

export default function DocsBrowser({ index, onEditRequest: _onEditRequest }: DocsBrowserProps) {
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(index.sections.map((s) => s.title))
  );

  const lowerSearch = search.toLowerCase().trim();
  const filteredSections = index.sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!lowerSearch) return true;
        return (
          item.title.toLowerCase().includes(lowerSearch) ||
          item.slug.toLowerCase().includes(lowerSearch) ||
          item.tags?.some((t) => t.toLowerCase().includes(lowerSearch)) ||
          item.description?.toLowerCase().includes(lowerSearch)
        );
      }),
    }))
    .filter((s) => s.items.length > 0);

  const totalDocs = index.sections.reduce((a, s) => a + s.items.length, 0);

  function toggleSection(title: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title); else next.add(title);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{totalDocs}</strong> {totalDocs === 1 ? "documento" : "documentos"}</span>
          <span className="text-border">·</span>
          <span><strong className="text-foreground">{index.sections.length}</strong> {index.sections.length === 1 ? "sección" : "secciones"}</span>
        </div>
        <div className="relative flex-1 sm:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar documentos…" className="pl-8 h-8 text-sm" />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {filteredSections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileSearch className="h-10 w-10 text-muted-foreground/40 mb-3" />
          {search ? (
            <>
              <p className="text-sm font-medium text-muted-foreground">Sin resultados para &quot;{search}&quot;</p>
              <button type="button" onClick={() => setSearch("")} className="mt-2 text-xs text-primary hover:underline cursor-pointer">Limpiar búsqueda</button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No hay documentos publicados todavía.</p>
          )}
        </div>
      )}
      <div className="space-y-3">
        {filteredSections.map((section) => {
          const isOpen = openSections.has(section.title);
          return (
            <div key={section.title} className="rounded-xl border border-border bg-card overflow-hidden">
              <button type="button" onClick={() => toggleSection(section.title)} className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/50 transition-colors cursor-pointer">
                <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-sm flex-1">{section.title}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{section.items.length} {section.items.length === 1 ? "doc" : "docs"}</span>
                {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              </button>
              {isOpen && (
                <div className="border-t border-border divide-y divide-border/60">
                  {section.items.map((item) => (
                    <div key={item.slug} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium leading-snug truncate">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                            <Hash className="h-3 w-3" />{item.slug}
                          </span>
                          {item.tags && item.tags.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Tag className="h-3 w-3" />
                              {item.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="bg-muted text-muted-foreground px-1.5 py-0 rounded text-[11px]">{tag}</span>
                              ))}
                              {item.tags.length > 3 && <span className="text-[11px] text-muted-foreground">+{item.tags.length - 3}</span>}
                            </span>
                          )}
                        </div>
                        {item.description && <p className="text-xs text-muted-foreground/70 truncate">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
