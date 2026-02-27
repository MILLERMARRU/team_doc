"use client";
// ============================================================
//  components/docs/Toc.tsx
//  Tabla de contenidos derecha (TOC) con resaltado activo
// ============================================================

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/docs";

interface TocProps {
  items: TocItem[];
}

export default function Toc({ items }: TocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = items.map((item) =>
      document.getElementById(item.id)
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="w-full flex flex-col">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 shrink-0">
        En esta página
      </p>
      <ul className="space-y-1 overflow-y-auto toc-scrollbar max-h-[calc(100vh-12rem)] pr-1">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                // Intentar por ID exacto primero
                let el = document.getElementById(item.id);
                // Fallback: buscar heading cuyo texto coincida
                if (!el) {
                  const headings = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
                  for (const h of headings) {
                    if (h.textContent?.trim() === item.text) {
                      el = h as HTMLElement;
                      break;
                    }
                  }
                }
                if (el) {
                  const offset = 80; // altura navbar (56px) + margen
                  const top = el.getBoundingClientRect().top + window.scrollY - offset;
                  window.scrollTo({ top, behavior: "smooth" });
                  window.history.pushState(null, "", `#${item.id}`);
                  setActiveId(item.id);
                }
              }}
              className={cn(
                "block text-sm py-0.5 transition-colors cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100",
                activeId === item.id
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>      {/* Línea de cierre */}
      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0" />    </div>
  );
}
