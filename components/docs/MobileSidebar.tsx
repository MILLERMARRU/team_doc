"use client";
// ============================================================
//  components/docs/MobileSidebar.tsx
//  Sidebar en un drawer para móvil
// ============================================================

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import type { DocsIndex } from "@/types";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  index: DocsIndex;
}

export default function MobileSidebar({ index }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón toggle */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "lg:hidden fixed bottom-5 right-5 z-40",
          "flex items-center justify-center w-12 h-12 rounded-full shadow-lg",
          "bg-blue-600 text-white"
        )}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-72",
          "bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800",
          "p-6 overflow-y-auto transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            Menú
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Sidebar index={index} />
      </aside>
    </>
  );
}
