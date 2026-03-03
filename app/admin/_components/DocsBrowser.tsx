"use client";
// ============================================================
//  app/admin/_components/DocsBrowser.tsx
//  Explorador de documentos: visualiza, edita y elimina .md
// ============================================================

import { useState } from "react";
import {
  Search,
  X,
  FileSearch,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { DocsIndex, DocItem } from "@/types";

// ── Props ────────────────────────────────────────────────────
interface DocsBrowserProps {
  index: DocsIndex;
  onEditRequest: (item: DocItem, content: string) => void;
}

// ── Componente ───────────────────────────────────────────────
export default function DocsBrowser({
  index,
  onEditRequest: _onEditRequest,
}: DocsBrowserProps) {
  const [search, setSearch] = useState("");

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
    </div>
  );
}
