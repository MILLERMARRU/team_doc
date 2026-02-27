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
    <div className="w-full">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
        En esta página
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              className={cn(
                "block text-sm py-0.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100",
                activeId === item.id
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
