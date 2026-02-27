// ============================================================
//  components/Navbar.tsx
//  Barra de navegación superior (Server Component con búsqueda)
// ============================================================

import Link from "next/link";
import { BookOpen, LayoutDashboard } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SearchCmdk from "@/components/docs/SearchCmdk";
import MobileMenu from "@/components/MobileMenu";
import { getDocsIndex } from "@/lib/docs";

export default async function Navbar() {
  let index;
  try {
    index = await getDocsIndex();
  } catch {
    index = { sections: [] };
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100 shrink-0"
        >
          <BookOpen className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
          <span>DocHubs</span>
        </Link>

        {/* Links */}
        <nav className="hidden sm:flex items-center gap-1 text-sm ml-2">
          <Link
            href="/docs"
            className="px-3 py-1.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/team"
            className="px-3 py-1.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Team
          </Link>
        </nav>

        {/* Espacio flexible */}
        <div className="flex-1" />

        {/* Búsqueda */}
        <SearchCmdk index={index} />

        {/* Admin */}
        <Link
          href="/admin"
          className="hidden sm:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          Admin
        </Link>

        {/* Tema */}
        <ThemeToggle />

        {/* Menú móvil */}
        <MobileMenu />
      </div>
    </header>
  );
}
