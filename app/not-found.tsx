"use client";
// ============================================================
//  app/not-found.tsx  –  Página 404 con auto-redirect a /
// ============================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      router.replace("/");
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, router]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
        <BookOpen className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
        Error 404
      </p>

      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Página no encontrada
      </h1>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm leading-relaxed">
        Esta ruta no existe. Serás redirigido al inicio en{" "}
        <span className="font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">
          {count}s
        </span>
        .
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Ir al inicio ahora
      </Link>
    </div>
  );
}
