"use client";
// ============================================================
//  app/admin/_components/AdminEditor.tsx
//  Editor para crear / actualizar documentación en GitHub
// ============================================================

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Eye,
  EyeOff,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { DocsIndex } from "@/types";

interface AdminEditorProps {
  username: string;
  index: DocsIndex;
}

type Status = "idle" | "loading" | "success" | "error";

export default function AdminEditor({ username, index }: AdminEditorProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Campos del formulario
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [customSection, setCustomSection] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("1");

  // UI
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const existingSections = index.sections.map((s) => s.title);
  const activeSection = section === "__new__" ? customSection : section;

  // Autocompletar slug desde título
  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slug) {
      const auto = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(auto);
    }
  }

  // Cargar .md desde archivo local
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatus("error");
      setMessage("El archivo es demasiado grande (máx. 2MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setContent(text);
    };
    reader.readAsText(file);
  }

  // Cerrar sesión
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  // Enviar al endpoint
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const fullSlug = activeSection
      ? `${activeSection.toLowerCase().replace(/\s+/g, "-")}/${slug}`
      : slug;

    try {
      const res = await fetch("/api/docs/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          section: activeSection,
          slug: fullSlug,
          content,
          order: parseInt(order, 10),
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Error desconocido");
        return;
      }

      setStatus("success");
      setMessage(`✓ Publicado en /docs/${data.slug}`);

      // Limpiar formulario
      setTitle("");
      setSection("");
      setCustomSection("");
      setSlug("");
      setContent("");
      setTags("");
      setDescription("");
      setOrder("1");

      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Error de red. Revisa la conexión.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Panel Admin
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Hola, <strong>{username}</strong> — Publica documentación directamente en GitHub
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* ── Columna izquierda ─────────────────────── */}
            <div className="space-y-5">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Título *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="Ej: Docker build"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Sección */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Sección *
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                >
                  <option value="">Selecciona o crea una sección</option>
                  {existingSections.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="__new__">+ Nueva sección</option>
                </select>
                {section === "__new__" && (
                  <input
                    type="text"
                    value={customSection}
                    onChange={(e) => setCustomSection(e.target.value)}
                    required
                    placeholder="Nombre de la nueva sección"
                    className="mt-2 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  />
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Slug *
                  <span className="ml-2 text-xs text-neutral-400 font-normal">
                    (solo minúsculas, números y guiones)
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400 shrink-0">
                    {activeSection
                      ? `${activeSection.toLowerCase().replace(/\s+/g, "-")}/`
                      : ""}
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    required
                    placeholder="docker-build"
                    className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Descripción corta
                  <span className="ml-2 text-xs text-neutral-400 font-normal">
                    (para búsqueda y tarjetas)
                  </span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del documento..."
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Tags
                  <span className="ml-2 text-xs text-neutral-400 font-normal">
                    (separados por coma)
                  </span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="docker, cli, devops"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Orden */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Orden dentro de la sección
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  min="1"
                  className="w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* ── Columna derecha: Editor Markdown ─────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Contenido Markdown *
                </label>
                <div className="flex items-center gap-2">
                  {/* Upload .md */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Cargar .md
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".md,.markdown,text/markdown"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Toggle preview */}
                  <button
                    type="button"
                    onClick={() => setPreview((p) => !p)}
                    className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    {preview ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Editor
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Vista previa
                      </>
                    )}
                  </button>
                </div>
              </div>

              {preview ? (
                /* Vista previa */
                <div className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 min-h-72 max-h-96 overflow-y-auto">
                  {content ? (
                    <div className="prose dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400 italic">
                      Sin contenido todavía...
                    </p>
                  )}
                </div>
              ) : (
                /* Editor de texto */
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder={`# Título del documento\n\nEscribe o pega tu Markdown aquí...\n\n## Sección\n\nContenido...`}
                  rows={16}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors resize-none"
                />
              )}

              {/* Info del archivo */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Info className="h-3.5 w-3.5 shrink-0" />
                {content
                  ? `${content.length.toLocaleString()} caracteres · ${(new Blob([content]).size / 1024).toFixed(1)} KB`
                  : "Pega o escribe Markdown, o carga un archivo .md"}
              </div>
            </div>
          </div>

          {/* Status */}
          {status !== "idle" && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm rounded-lg px-4 py-3 border",
                status === "success" &&
                  "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
                status === "error" &&
                  "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400",
                status === "loading" &&
                  "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
              )}
            >
              {status === "success" && <CheckCircle className="h-4 w-4 shrink-0" />}
              {status === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
              {status === "loading" && (
                <span className="h-4 w-4 shrink-0 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              )}
              {status === "loading" ? "Guardando en GitHub..." : message}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-400">
              Se guardará en GitHub y será visible de inmediato.
            </p>
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-5 py-2.5 transition-colors"
            >
              {status === "loading" ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Publicar documento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
