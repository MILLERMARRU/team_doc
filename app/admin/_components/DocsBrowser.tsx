"use client";
// ============================================================
//  app/admin/_components/DocsBrowser.tsx
//  Explorador de documentos: visualiza, edita y elimina .md
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, FileSearch, FolderOpen, FileText,
  ChevronDown, ChevronRight, Hash, Tag, Pencil, Loader2,
  Trash2, AlertTriangle, History,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import HistoryPanel from "./HistoryPanel";
import type { DocsIndex, DocItem } from "@/types";

interface DocsBrowserProps {
  index: DocsIndex;
  username: string;
  onEditRequest: (item: DocItem, content: string) => void;
}

export default function DocsBrowser({ index, username, onEditRequest }: DocsBrowserProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(index.sections.map((s) => s.title))
  );
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [historyItem, setHistoryItem] = useState<DocItem | null>(null);

  const lowerSearch = search.toLowerCase().trim();
  const filteredSections = index.sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Solo mostrar docs del usuario actual (o sin dueño asignado = legado)
        const isOwner = !item.createdBy || item.createdBy === username;
        if (!isOwner) return false;
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

  const totalDocs = filteredSections.reduce((a, s) => a + s.items.length, 0);

  function toggleSection(title: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title); else next.add(title);
      return next;
    });
  }

  async function handleEdit(item: DocItem) {
    if (loadingEdit) return;
    setLoadingEdit(item.slug);
    try {
      const path = `docs/${item.slug}.md`;
      const res = await fetch(`/api/docs/file?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error("No se pudo cargar el documento.");
      const data = await res.json();
      onEditRequest(item, data.content);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar el documento.");
    } finally {
      setLoadingEdit(null);
    }
  }

  async function handleDelete(slug: string) {
    if (loadingDelete) return;
    setLoadingDelete(slug);
    try {
      const res = await fetch("/api/docs/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al eliminar el documento.");
      }
      const data = await res.json();
      toast.success(`"${slug}" eliminado correctamente.`);
      if (data.deletedImages?.length) {
        toast.info(`${data.deletedImages.length} ${data.deletedImages.length === 1 ? "imagen eliminada" : "imágenes eliminadas"} del repositorio.`);
      }
      setConfirmDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoadingDelete(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{totalDocs}</strong> {totalDocs === 1 ? "documento" : "documentos"}</span>
          <span className="text-border">·</span>
          <span><strong className="text-foreground">{filteredSections.length}</strong> {filteredSections.length === 1 ? "sección" : "secciones"}</span>
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
                    <div key={item.slug}>
                      <div className="group flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
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
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 cursor-pointer" title="Editar documento" disabled={!!loadingEdit || !!loadingDelete} onClick={() => handleEdit(item)}>
                            {loadingEdit === item.slug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                          </Button>
                          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 cursor-pointer" title="Historial de versiones" disabled={!!loadingEdit || !!loadingDelete} onClick={() => setHistoryItem(item)}>
                            <History className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer" title="Eliminar documento" disabled={!!loadingDelete || !!loadingEdit} onClick={() => setConfirmDelete(confirmDelete === item.slug ? null : item.slug)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {confirmDelete === item.slug && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 px-4 py-3 bg-destructive/5 border-t border-destructive/20">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                            <p className="text-xs text-destructive">¿Eliminar <strong>{item.title}</strong>? Esta acción no se puede deshacer.</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-xs cursor-pointer" onClick={() => setConfirmDelete(null)} disabled={!!loadingDelete}>Cancelar</Button>
                            <Button type="button" size="sm" variant="destructive" className="h-6 px-2 text-xs cursor-pointer" onClick={() => handleDelete(item.slug)} disabled={!!loadingDelete}>
                              {loadingDelete === item.slug ? <Loader2 className="h-3 w-3 animate-spin" /> : "Eliminar"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {historyItem && (
        <HistoryPanel
          item={historyItem}
          onClose={() => setHistoryItem(null)}
          onRestored={() => router.refresh()}
        />
      )}
    </div>
  );
}
