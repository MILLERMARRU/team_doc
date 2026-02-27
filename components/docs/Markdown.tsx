"use client";
// ============================================================
//  components/docs/Markdown.tsx
//  Renderizador de Markdown seguro y con estilo tipo docs
// ============================================================

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

// Extendemos el schema para permitir IDs y aria en headings (para rehype-slug)
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "id", "aria-hidden"],
    a: [
      ...(defaultSchema.attributes?.["a"] ?? []),
      "href",
      "title",
      "target",
      "rel",
      "id",
      "aria-label",
    ],
    code: [
      ...(defaultSchema.attributes?.["code"] ?? []),
      "className",
      "class",
    ],
    span: [
      ...(defaultSchema.attributes?.["span"] ?? []),
      "className",
      "class",
      "style",
    ],
    pre: [
      ...(defaultSchema.attributes?.["pre"] ?? []),
      "className",
      "class",
    ],
  },
};

export default function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        // Prosa base
        "prose dark:prose-invert max-w-none",
        // Colores personalizados
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800",
        "prose-code:rounded prose-code:px-1.5 prose-code:py-0.5",
        "prose-code:text-sm prose-code:font-mono",
        "prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-900",
        "prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800",
        "prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-600",
        "prose-hr:border-neutral-200 dark:prose-hr:border-neutral-700",
        "prose-table:text-sm",
        "prose-th:bg-neutral-50 dark:prose-th:bg-neutral-800",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: {
                className: ["anchor"],
                ariaLabel: "Enlace a sección",
              },
            },
          ],
          [rehypeSanitize, sanitizeSchema],
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
