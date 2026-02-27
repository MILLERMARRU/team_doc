// ============================================================
//  app/page.tsx  –  Landing page
// ============================================================

import Link from "next/link";
import { BookOpen, Zap, Github, ArrowRight, Shield, RefreshCw } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-32 px-4 text-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{background: "radial-gradient(ellipse at top, rgba(59,130,246,0.08), transparent 70%)"}}
        />

        <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-3 py-1 mb-6">
          <Zap className="h-3 w-3" />
          Sin redeploy · GitHub como storage
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 max-w-3xl mx-auto leading-tight">
          Documentación técnica{" "}
          <span className="text-blue-600 dark:text-blue-400">autogestionable</span>
        </h1>

        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
          Sube o pega Markdown desde el panel admin y el contenido aparece{" "}
          <strong className="text-neutral-800 dark:text-neutral-200">al instante</strong> en el sitio.
          Sin builds. Sin deploys.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Ver documentación
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-semibold rounded-lg px-5 py-2.5 border border-neutral-200 dark:border-neutral-700 transition-colors"
          >
            Panel Admin <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="py-16 px-4 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-screen-lg mx-auto">
          <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-10">
            ¿Cómo funciona?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Github className="h-5 w-5" />, title: "GitHub como storage", description: "Los archivos .md y el index.json se guardan en tu repo de GitHub via API. Sin base de datos." },
              { icon: <Zap className="h-5 w-5" />, title: "Zero redeploy", description: "El sitio lee desde GitHub en runtime. Subes un doc y aparece de inmediato. Sin builds ni deploys." },
              { icon: <Shield className="h-5 w-5" />, title: "Seguro por diseño", description: "El token de GitHub nunca llega al cliente. Auth por JWT. Markdown sanitizado contra XSS." },
              { icon: <BookOpen className="h-5 w-5" />, title: "Look tipo Next.js Docs", description: "Layout 3 columnas: sidebar, contenido con TOC. Fuente Geist, dark mode, diseño profesional." },
              { icon: <RefreshCw className="h-5 w-5" />, title: "Caché inteligente", description: "ISR con revalidación cada 2 minutos. No bombardea GitHub en cada request." },
              { icon: <ArrowRight className="h-5 w-5" />, title: "Búsqueda ⌘K", description: "Paleta de búsqueda sobre títulos, secciones y tags. Sin dependencias externas." },
            ].map((f) => (
              <div key={f.title} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">{f.icon}</div>
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">{f.title}</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────── */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Listo para comenzar</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-sm max-w-md mx-auto">
          Configura tus variables de entorno con tu token de GitHub y empieza a publicar documentación en minutos.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/admin" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors">
            Ir al admin <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/docs" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Ver docs →
          </Link>
        </div>
      </section>
    </div>
  );
}
