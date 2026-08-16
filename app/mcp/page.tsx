// ============================================================
//  app/mcp/page.tsx  –  Landing pública del servidor MCP
//  Explica qué hace, qué credenciales pide y cómo solicitarlas.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import {
  Bot,
  FilePlus,
  Pencil,
  FileText,
  ListTree,
  Trash2,
  KeyRound,
  Mail,
  Github,
  Terminal,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Servidor MCP | DocHubs",
  description:
    "Dejá que tu asistente de IA cree, edite y lea la documentación directamente, sin pasar por el panel admin.",
};

const tools = [
  { icon: <FilePlus className="h-4 w-4" />, name: "create_doc", body: "Crea un doc nuevo (auto-genera slug, sección y tags)." },
  { icon: <Pencil className="h-4 w-4" />, name: "update_doc", body: "Actualiza un doc existente por su slug." },
  { icon: <FileText className="h-4 w-4" />, name: "get_doc", body: "Lee el Markdown completo de un doc." },
  { icon: <ListTree className="h-4 w-4" />, name: "list_docs", body: "Lista todos los docs, filtrables por sección." },
  { icon: <Trash2 className="h-4 w-4" />, name: "delete_doc", body: "Borra un doc (respeta el dueño original)." },
];

const exampleConfig = `{
  "mcpServers": {
    "dochubs": {
      "type": "stdio",
      "command": "npx",
      "args": ["dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← te lo damos al aprobar tu acceso",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← te lo damos al aprobar tu acceso"
      }
    }
  }
}`;

export default function McpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* ── Hero ── */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full px-3 py-1 mb-6">
          <Bot className="h-3 w-3" />
          Model Context Protocol
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-4">
          Dejá que tu IA escriba la documentación
        </h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          DocHubs incluye un servidor MCP: conectalo a Claude Code, Cursor,
          Windsurf o cualquier asistente compatible y creá, editá y consultá
          docs directamente desde el chat, sin abrir el panel admin.
        </p>
      </div>

      {/* ── Qué puede hacer ── */}
      <section className="mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4 text-center">
          Qué puede hacer tu asistente
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {tools.map((t) => (
            <div
              key={t.name}
              className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
            >
              <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400 shrink-0">
                {t.icon}
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {t.name}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {t.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Qué hace falta pedir ── */}
      <section className="mb-16 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Necesitás pedirnos acceso
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">
              El servidor MCP escribe directamente en el repo de GitHub donde
              viven los docs, así que necesita un token con permisos de
              escritura. No es autoservicio: escribinos y te damos las dos
              credenciales privadas que hacen falta.
            </p>
            <ul className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1.5 mb-4">
              <li>
                <code className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5">
                  GITHUB_TOKEN
                </code>{" "}
                : Fine-grained PAT con acceso de escritura al repo de docs
              </li>
              <li>
                <code className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5">
                  REVALIDATE_SECRET
                </code>{" "}
                : para que tus cambios se vean al instante (opcional, pero recomendado)
              </li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <a
                href="mailto:millermarru4@gmail.com?subject=Acceso%20al%20MCP%20de%20DocHubs"
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-neutral-900 hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-300 text-white dark:text-neutral-900 rounded-lg px-4 py-2 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Solicitar acceso a Miller
              </a>
              <a
                href="mailto:samleninvasques@gmail.com?subject=Acceso%20al%20MCP%20de%20DocHubs"
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-2 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Solicitar acceso a Sam
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo conectarlo ── */}
      <section className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4 text-center">
          Cómo conectarlo (Claude Code)
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 text-center max-w-lg mx-auto">
          Pegá esto en <code className="text-xs">.mcp.json</code> (raíz del
          proyecto) o <code className="text-xs">~/.claude/settings.json</code>,
          reemplazando los dos valores que te dimos por email.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 text-xs font-mono leading-relaxed text-neutral-700 dark:text-neutral-300">
          {exampleConfig}
        </pre>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 text-center">
          En Windows, <code>npx</code> necesita el wrapper <code>cmd /c</code>.
        </p>
      </section>

      {/* ── Más clientes ── */}
      <div className="text-center">
        <Link
          href="https://github.com/MILLERMARRU/team_doc/blob/main/mcp/README.md"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Github className="h-3.5 w-3.5" />
          Ver la config para Cursor, Windsurf, Gemini CLI y Cline
        </Link>
        <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500 inline-flex items-center gap-1.5">
          <Terminal className="h-3 w-3" />
          Publicado en npm como{" "}
          <code className="bg-neutral-100 dark:bg-neutral-800 rounded px-1">
            dochubs-mcp
          </code>
        </p>
      </div>
    </div>
  );
}
