// ============================================================
//  app/page.tsx  –  Landing page
// ============================================================

import Link from "next/link";
import { BookOpen, Zap, Github, ArrowRight, Shield, RefreshCw, Lightbulb, Code2, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-36 px-4 text-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(ellipse at top, rgba(59,130,246,0.07), transparent 65%)" }}
        />

        <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-3 py-1 mb-8">
          <Zap className="h-3 w-3" />
          Aprendemos · Documentamos · Compartimos
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 max-w-3xl mx-auto leading-tight">
          Nuestro conocimiento merece{" "}
          <span className="text-blue-600 dark:text-blue-400">un lugar donde vivir</span>
        </h1>

        <p className="mt-6 text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Escribimos lo que aprendemos en Markdown, lo publicamos{" "}
          <span className="text-neutral-800 dark:text-neutral-200 font-medium">al instante</span> y
          lo compartimos con quien lo necesite. Sin builds, sin deploys, sin fricción.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors shadow-sm"
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

      {/* ── Para qué está construido ─────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-4">
            De developers, para developers
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 leading-snug">
            Un lugar para compartir lo que aprendes
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-base leading-relaxed mb-12">
            Este sitio nació con una idea simple: aprender en público. No importa el stack, el lenguaje o el nivel —
            lo que importa es documentar el camino. Cada cosa que resuelves, cada concepto que entiendes,
            cada proyecto que construyes merece un lugar donde vivir y ser encontrado por alguien más
            que está pasando por lo mismo.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: <Code2 className="h-5 w-5" />,
                title: "Cualquier stack",
                body: "Frontend, backend, DevOps, mobile, bases de datos… si lo aprendiste, puede vivir aquí. Sin restricciones de tecnología.",
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Conocimiento compartido",
                body: "Lo que documentes hoy puede ahorrarle horas a alguien mañana. El conocimiento crece cuando se comparte.",
              },
              {
                icon: <Lightbulb className="h-5 w-5" />,
                title: "Aprende escribiendo",
                body: "Explicar lo que sabes es la forma más efectiva de consolidarlo. Escribir es pensar con claridad.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 p-5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mb-1">{item.title}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divisor ─────────────────────────────────────── */}
      <div className="px-4">
        <div className="max-w-5xl mx-auto border-t border-neutral-100 dark:border-neutral-800" />
      </div>

      {/* ── Tips para recrearlo ──────────────────────────── */}
      <section className="py-20 px-4 bg-neutral-50 dark:bg-neutral-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-3">
              Código abierto
            </p>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 leading-snug">
              ¿Este proyecto te inspiró?<br />
              <span className="text-neutral-500 dark:text-neutral-400 font-normal">Recréalo, adáptalo, hazlo tuyo.</span>
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Ya sea para compartir tu aprendizaje, documentar tus proyectos personales o construir
              algo completamente diferente — aquí van los fundamentos que hacen funcionar este sistema.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Github className="h-4 w-4" />,
                title: "GitHub como base de datos",
                body: "Usa la API de GitHub para guardar archivos .md y un index.json. Sin base de datos, sin infraestructura extra.",
              },
              {
                icon: <Zap className="h-4 w-4" />,
                title: "ISR para el caché",
                body: "Next.js ISR con revalidación corta. El contenido actualiza sin rebuild. El secreto está en fetch con revalidate.",
              },
              {
                icon: <Shield className="h-4 w-4" />,
                title: "Auth mínima pero sólida",
                body: "JWT con cookie HttpOnly para el panel admin. El token de GitHub nunca sale del servidor.",
              },
              {
                icon: <BookOpen className="h-4 w-4" />,
                title: "Markdown + rehype",
                body: "react-markdown con rehype-slug, rehype-autolink-headings y rehype-sanitize. TOC generado del AST.",
              },
              {
                icon: <RefreshCw className="h-4 w-4" />,
                title: "Estructura del index",
                body: "Un solo index.json con secciones, items, slugs y orden. Simple de mantener, fácil de extender.",
              },
              {
                icon: <Code2 className="h-4 w-4" />,
                title: "Sin vendor lock-in",
                body: "Next.js, Tailwind, shadcn/ui. Todo open source. Despliega en Vercel, Netlify o donde quieras.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 rounded-md text-neutral-500 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">{f.title}</h3>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
