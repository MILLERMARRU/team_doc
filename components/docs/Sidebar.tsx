"use client";
// ============================================================
//  components/docs/Sidebar.tsx
//  Sidebar izquierda con navegación por secciones e items
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DocsIndex } from "@/types";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  index: DocsIndex;
}

export default function Sidebar({ index }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-full pr-4">
      {index.sections.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 px-2 py-4">
          Sin documentación todavía.
          <br />
          Ve al{" "}
          <Link href="/admin" className="text-blue-500 hover:underline">
            panel admin
          </Link>{" "}
          para agregar contenido.
        </p>
      ) : (
        index.sections.map((section) => (
          <SidebarSection
            key={section.title}
            section={section}
            pathname={pathname}
          />
        ))
      )}
    </nav>
  );
}

interface SidebarSectionProps {
  section: DocsIndex["sections"][number];
  pathname: string;
}

function SidebarSection({ section, pathname }: SidebarSectionProps) {
  const isAnyActive = section.items.some(
    (item) => pathname === `/docs/${item.slug}`
  );
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 w-full text-left px-2 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 transition-transform",
            open && "rotate-90"
          )}
        />
        {section.title}
      </button>

      {open && (
        <ul className="mt-1 space-y-0.5">
          {section.items.map((item) => {
            const href = `/docs/${item.slug}`;
            const active = pathname === href;
            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  )}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
