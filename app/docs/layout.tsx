// ============================================================
//  app/docs/layout.tsx
//  Layout de 3 columnas: Sidebar | Contenido | TOC
// ============================================================

import type { ReactNode } from "react";
import Sidebar from "@/components/docs/Sidebar";
import MobileSidebar from "@/components/docs/MobileSidebar";
import { getDocsIndex } from "@/lib/docs";

export default async function DocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  let index;
  try {
    index = await getDocsIndex();
  } catch {
    index = { sections: [] };
  }

  return (
    <div className="max-w-full px-16 flex min-h-[calc(100vh-3.5rem)]">
      {/* ── Columna izquierda: Sidebar (escritorio) ─────────── */}
      <aside className="hidden lg:block w-56 xl:w-64 shrink-0 py-8 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto thin-scrollbar">
        <Sidebar index={index} />
      </aside>

      {/* ── Separador vertical ──────────────────────────────── */}
      <div className="hidden lg:block w-px bg-neutral-200 dark:bg-neutral-800 mx-4" />

      {/* ── Columna central: contenido ──────────────────────── */}
      <div className="flex-1 min-w-0 py-8 px-0 lg:px-6">
        {children}
      </div>

      {/* ── Sidebar móvil ───────────────────────────────────── */}
      <MobileSidebar index={index} />
    </div>
  );
}
