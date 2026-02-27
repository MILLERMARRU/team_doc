// ============================================================
//  components/Footer.tsx
//  Footer global – estilo Next.js docs
// ============================================================

import Link from "next/link";
import { BookOpen, Github, Globe, Linkedin, Mail, Phone } from "lucide-react";

const year = new Date().getFullYear();

const columns = [
  {
    heading: "Explorar",
    links: [
      { label: "Documentación", href: "/docs" },
      { label: "Team",          href: "/team" },
      { label: "Panel Admin",   href: "/admin" },
    ],
  },
  {
    heading: "Proyecto",
    links: [
      { label: "GitHub",        href: "https://github.com/MILLERMARRU", external: true },
      { label: "Licencia MIT",  href: "https://opensource.org/licenses/MIT", external: true },
    ],
  },
  {
    heading: "Contacto",
    links: [
      { label: "millermarru.dev",       href: "https://www.millermarru.dev/",                  external: true },
      { label: "millermarru4@gmail.com",href: "mailto:millermarru4@gmail.com" },
      { label: "LinkedIn",              href: "https://www.linkedin.com/in/millerzamora/",      external: true },
      { label: "+91 930 535 560",       href: "tel:+91930535560" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Licencia MIT",  href: "https://opensource.org/licenses/MIT", external: true },
      { label: "Código abierto", href: "https://github.com/MILLERMARRU",    external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ── Grid principal ──────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10">

          {/* Logo + descripción */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100"
            >
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>DocHubs</span>
            </Link>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-50">
              Aprende, documenta y comparte tu conocimiento técnico sin friction.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-1">
              <Link
                href="https://github.com/MILLERMARRU"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="https://www.millermarru.dev/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sitio web"
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <Globe className="h-4 w-4" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/millerzamora/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="mailto:millermarru4@gmail.com"
                aria-label="Email"
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </Link>
              <Link
                href="tel:+91930535560"
                aria-label="Teléfono"
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <Phone className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Columnas de links */}
          {columns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={"external" in link && link.external ? "_blank" : undefined}
                      rel={"external" in link && link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Barra inferior ──────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            © {year} DocHubs. Licencia{" "}
            <Link
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-700 dark:hover:text-neutral-300 underline underline-offset-2 transition-colors"
            >
              MIT
            </Link>
            .
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/MILLERMARRU"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/millerzamora/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link
              href="https://github.com/Seninhg/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              aria-label="GitHub Sam"
            >
              <Github className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
