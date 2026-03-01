"use client";
// ============================================================
//  components/docs/Markdown.tsx
//  Renderizador de Markdown con syntax highlighting (shiki themes)
// ============================================================

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ComponentPropsWithoutRef } from "react";
import { MermaidBlock } from "@/components/docs/MermaidBlock";

// ── Botón de copiar ───────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copiado" : "Copiar código"}
      className="p-1.5 rounded-md transition-all duration-150 cursor-pointer text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
      )}
    </button>
  );
}

// ── Alias de lenguajes → lenguaje real de Prism ──────────
const LANG_ALIASES: Record<string, string> = {
  node: "javascript",
  nodejs: "javascript",
  js: "javascript",
  ts: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  npm: "bash",
  pnpm: "bash",
  npx: "bash",
  bun: "bash",
  py: "python",
  rb: "ruby",
  yml: "yaml",
};

// ── Componente código con syntax highlighting ─────────────
function CodeBlock({
  className,
  children,
}: ComponentPropsWithoutRef<"code">) {
  const { resolvedTheme } = useTheme();
  const match = /language-(\w+)/.exec(className || "");
  const rawLang = match?.[1] ?? "";
  const lang = LANG_ALIASES[rawLang] ?? rawLang;
  const codeString = String(children).replace(/\n$/, "");

  // Diagrama Mermaid
  if (rawLang === "mermaid") {
    return <MermaidBlock code={codeString} />;
  }

  // Bloque con lenguaje → syntax highlighting
  if (match) {
    const isDark = resolvedTheme === "dark";
    return (
      <div className="relative my-6 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
        {/* Header: lenguaje + copiar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] font-mono font-medium text-neutral-400 dark:text-neutral-500 select-none">{rawLang}</span>
          <CopyButton text={codeString} />
        </div>
        <div>
          <SyntaxHighlighter
            language={lang}
            style={isDark ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              border: "none",
              backgroundColor: isDark ? "#0a0a0a" : "#f9fafb",
              padding: "1rem",
              fontSize: "0.8125rem",
              lineHeight: "1.6",
              fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
            }}
            codeTagProps={{
              style: {
                fontFamily: "inherit",
                fontSize: "inherit",
              },
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  // Bloque sin lenguaje
  const isBlock = codeString.includes("\n");
  if (isBlock) {
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] font-mono font-medium text-neutral-400 dark:text-neutral-500 select-none">code</span>
          <CopyButton text={codeString} />
        </div>
        <pre className="overflow-x-auto bg-neutral-50 dark:bg-neutral-950 p-4 text-sm font-mono text-neutral-800 dark:text-neutral-200 leading-relaxed">
          <code>{children}</code>
        </pre>
      </div>
    );
  }

  // Inline code
  return (
    <code className="bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5 text-[0.8125rem] font-mono text-neutral-800 dark:text-neutral-200">
      {children}
    </code>
  );
}

// pre transparente: el bloque lo gestiona CodeBlock
function TransparentPre({ children }: ComponentPropsWithoutRef<"pre">) {
  return <>{children}</>;
}

interface MarkdownProps {
  content: string;
  className?: string;
}

// Extendemos el schema para permitir IDs y aria en headings (para rehype-slug)
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "id", "aria-hidden", "tabIndex", "tabindex"],
    a: [
      ...(defaultSchema.attributes?.["a"] ?? []),
      "href",
      "title",
      "target",
      "rel",
      "id",
      "aria-label",
      "className",
      "class",
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
        // Headings: tamaño reducido, color neutro (nunca azul)
        "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:scroll-mt-20",
        "prose-headings:text-neutral-900 dark:prose-headings:text-neutral-100",
        "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base",
        // Anchors DENTRO de headings: forzar color inherit para que no sean azules
        "[&_:is(h1,h2,h3,h4,h5,h6)_a]:text-inherit",
        "[&_:is(h1,h2,h3,h4,h5,h6)_a]:no-underline",
        "[&_:is(h1,h2,h3,h4,h5,h6)_a]:decoration-transparent",
        "[&_:is(h1,h2,h3,h4,h5,h6)_a:hover]:text-inherit",
        "[&_:is(h1,h2,h3,h4,h5,h6)_a:hover]:no-underline",
        "[&_:is(h1,h2,h3,h4,h5,h6)_a:hover]:decoration-transparent",
        // Links en el contenido (no headings)
        "prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline",
        // Code inline — solo aplica a code que NO está dentro de pre
        "prose-code:before:content-none prose-code:after:content-none",
        "[&_:not(pre)>code]:bg-neutral-100 dark:[&_:not(pre)>code]:bg-neutral-800",
        "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5",
        "[&_:not(pre)>code]:text-[0.8125rem] [&_:not(pre)>code]:font-mono",
        "[&_:not(pre)>code]:text-neutral-800 dark:[&_:not(pre)>code]:text-neutral-200",
        // Anular estilos prose en code/span DENTRO de pre (el highlighter usa inline styles propios)
        "[&_pre_code]:bg-transparent! [&_pre_code]:p-0! [&_pre_code]:rounded-none!",
        "[&_pre_span]:bg-transparent! [&_pre_span]:p-0!",
        // Pre: sin estilos propios (lo gestiona CodeBlock con su propio wrapper)
        "prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-none prose-pre:my-0 prose-pre:shadow-none",
        // Otros elementos
        "prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-600",
        "prose-hr:border-neutral-200 dark:prose-hr:border-neutral-700",
        "prose-table:text-sm",
        "prose-th:bg-neutral-50 dark:prose-th:bg-neutral-800",
        // Texto del cuerpo
        "prose-p:text-neutral-700 dark:prose-p:text-neutral-300",
        "prose-li:text-neutral-700 dark:prose-li:text-neutral-300",
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
                className: ["heading-anchor"],
              },
            },
          ],
          [rehypeSanitize, sanitizeSchema],
        ]}
        components={{
          pre: TransparentPre,
          code: CodeBlock,
          table: ({ children }) => (
            <div className="overflow-x-auto w-full my-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <table className="min-w-full">{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
