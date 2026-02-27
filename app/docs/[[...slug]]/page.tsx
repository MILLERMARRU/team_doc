// ============================================================
//  app/docs/[[...slug]]/page.tsx
//  Página dinámica de documentación.
//  /docs          → índice de secciones
//  /docs/a/b/c    → renderiza el .md del slug a/b/c
// ============================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocsIndex, getDocContent, findItemBySlug, extractToc } from "@/lib/docs";
import Markdown from "@/components/docs/Markdown";
import Toc from "@/components/docs/Toc";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

// ── Metadata dinámica ──────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return { title: "Documentación | DocHub" };

  const slugStr = slug.join("/");
  const index = await getDocsIndex();
  const item = findItemBySlug(index, slugStr);

  return {
    title: item ? `${item.title} | DocHub` : "Documentación | DocHub",
    description: item?.description ?? "Documentación técnica autogestionable.",
  };
}

// ── Página ────────────────────────────────────────────────

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;

  // ── Sin slug → página índice de docs ──────────────────────
  if (!slug || slug.length === 0) {
    return <DocsIndexPage />;
  }

  const slugStr = slug.join("/");

  // ── Con slug → renderizar el documento ────────────────────
  const [index, content] = await Promise.all([
    getDocsIndex(),
    getDocContent(slugStr),
  ]);

  if (!content) notFound();

  const item = findItemBySlug(index, slugStr);
  const toc = extractToc(content);

  return (
    <div className="flex gap-8 xl:gap-12">
      {/* Contenido principal */}
      <article className="flex-1 min-w-0">
        {/* Breadcrumb */}
        {item && (
          <nav className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            <Link href="/docs" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Docs
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-medium">
              {item.title}
            </span>
          </nav>
        )}

        {/* Tags */}
        {item?.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Markdown */}
        <Markdown content={content} />

        {/* Footer del doc */}
        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-xs text-neutral-400">
            Contenido almacenado en GitHub. Los cambios se ven de inmediato sin redeploy.
          </p>
        </div>
      </article>

      {/* TOC derecha */}
      {toc.length > 0 && (
        <aside className="hidden xl:block w-48 shrink-0 sticky top-20 h-fit">
          <Toc items={toc} />
        </aside>
      )}
    </div>
  );
}

// ── Sub-componente: página índice de docs ─────────────────

async function DocsIndexPage() {
  let index;
  try {
    index = await getDocsIndex();
  } catch {
    index = { sections: [] };
  }

  return (
    <div className="max-w-3xl">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Documentación</h1>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Toda la documentación técnica en un solo lugar. Actualizada al instante sin redeploy.
        </p>
      </div>

      {/* Sin secciones todavía */}
      {index.sections.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center">
          <BookOpen className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
          <h2 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Sin documentación todavía
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Ve al panel de administración para crear tu primera doc.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ir al panel admin <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Grid de secciones */}
      {index.sections.length > 0 && (
        <div className="space-y-8">
          {index.sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
                {section.title}
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {section.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/docs/${item.slug}`}
                      className="block p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                              {item.description}
                            </p>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
