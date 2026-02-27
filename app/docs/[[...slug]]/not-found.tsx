// ============================================================
//  app/docs/[[...slug]]/not-found.tsx
//  Página 404 personalizada para documentos no encontrados
// ============================================================

import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function DocNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-2xl mb-6">
        <FileQuestion className="h-12 w-12 text-neutral-400" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Documento no encontrado
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
        Este documento no existe o fue eliminado del repositorio de GitHub.
      </p>
      <Link
        href="/docs"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la documentación
      </Link>
    </div>
  );
}
