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
  Info,
  Loader2,
  Type,
  FolderOpen,
  Hash,
  AlignLeft,
  Tag,
  ListOrdered,
  FileCode,
  LogOut,
  ImageIcon,
  FilePlus,
  LayoutList,
} from "lucide-react";
import DocsBrowser from "./DocsBrowser";
import { toast } from "sonner";
import Markdown from "@/components/docs/Markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DocsIndex } from "@/types";

// ── Componente principal ─────────────────────────────────────
interface AdminEditorProps {
  username: string;
  index: DocsIndex;
}

export default function AdminEditor({ username, index }: AdminEditorProps) {
  const router      = useRouter();
  const fileRef     = useRef<HTMLInputElement>(null);
  const imageRef    = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  const [preview, setPreview]               = useState(false);
  const [loading, setLoading]               = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ── Vista activa: editor o explorador ───────────────────
  const [view, setView] = useState<"new" | "browser">("new");

  const totalDocs = index.sections.reduce((a, s) => a + s.items.length, 0);

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

  // ── Insertar texto en la posición del cursor ─────────────
  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    if (!ta) {
      setContent((c) => c + text);
      return;
    }
    const start = ta.selectionStart ?? content.length;
    const end   = ta.selectionEnd   ?? content.length;
    const newContent = content.slice(0, start) + text + content.slice(end);
    setContent(newContent);
    requestAnimationFrame(() => {
      ta.selectionStart = start + text.length;
      ta.selectionEnd   = start + text.length;
      ta.focus();
    });
  }

  // ── Lógica común de subida de imagen ─────────────────────
  async function uploadImageFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagen demasiado grande", {
        description: "El archivo supera el límite de 5 MB.",
      });
      return;
    }

    const ext     = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
    const rawName =
      file.name && file.name !== "image.png"
        ? file.name
        : `screenshot-${Date.now()}.${ext}`;

    setUploadingImage(true);
    const toastId = toast.loading("Subiendo imagen a GitHub…");

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const dataUrl = ev.target?.result as string;
        const base64  = dataUrl.split(",")[1];

        const res = await fetch("/api/docs/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: rawName, base64 }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error("No se pudo subir la imagen", {
            id: toastId,
            description: data.error ?? "Error desconocido.",
          });
          return;
        }

        const altText  = rawName.replace(/\.[^.]+$/, "");
        const markdown = `![${altText}](${data.url})`;
        insertAtCursor(markdown);

        toast.success("Imagen subida", {
          id: toastId,
          description: "Insertada en el documento como Markdown.",
        });
      } catch {
        toast.error("Error de conexión", {
          id: toastId,
          description: "No se pudo conectar con el servidor.",
        });
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  }

  // ── Botón "Subir imagen" → selector de archivos ──────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await uploadImageFile(file);
  }

  // ── Ctrl+V / Cmd+V con imagen en el portapapeles ─────────
  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items     = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (!imageItem) return;

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (file) await uploadImageFile(file);
  }

  // Cargar .md desde archivo local
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Archivo demasiado grande", {
        description: "El archivo supera el límite de 2 MB permitido.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setContent(text);
      toast.success("Archivo cargado", {
        description: `${file.name} cargado correctamente.`,
      });
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
    setLoading(true);

    const toastId = toast.loading("Guardando en GitHub...", {
      description: "Esto puede tardar unos segundos.",
    });

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
        toast.error("No se pudo publicar", {
          id: toastId,
          description: data.error ?? "Error desconocido.",
        });
        return;
      }

      toast.success("Documento publicado", {
        id: toastId,
        description: `Disponible en /docs/${data.slug}`,
      });

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
      toast.error("Error de conexión", {
        id: toastId,
        description: "No se pudo conectar con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Panel Admin</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Hola,{" "}
              <strong className="text-foreground">{username}</strong>
              {" "}— Publica y gestiona tu documentación en GitHub
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-red-400 dark:text-red-400/70 transition-colors hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>

        {/* ── Tabs de navegación ── */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl mb-8 w-fit">
          <button
            type="button"
            onClick={() => setView("new")}
            className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === "new"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FilePlus className="h-3.5 w-3.5" />
            Nuevo documento
          </button>
          <button
            type="button"
            onClick={() => setView("browser")}
            className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === "browser"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="h-3.5 w-3.5" />
            Mis documentos
            {totalDocs > 0 && (
              <span className="ml-0.5 text-[11px] bg-muted-foreground/20 text-muted-foreground px-1.5 py-0 rounded-full">
                {totalDocs}
              </span>
            )}
          </button>
        </div>

        {/* ── Vista: Explorador de documentos ── */}
        {view === "browser" && (
          <DocsBrowser index={index} onEditRequest={() => {}} />
        )}

        {/* ── Vista: Formulario editor ── */}
        {view === "new" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid 40 / 60 */}
          <div className="grid gap-6 md:grid-cols-[40%_60%]">

            {/* ── Columna izquierda (40%) ────────────────── */}
            <div className="space-y-4">

              {/* Título */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-muted-foreground" />
                  Título <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="Ej: Guía de Docker"
                />
              </div>

              {/* Sección */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Sección <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Select value={section} onValueChange={setSection} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona o crea una sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingSections.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__">
                      <span className="text-primary font-medium">+ Nueva sección</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {section === "__new__" && (
                  <Input
                    value={customSection}
                    onChange={(e) => setCustomSection(e.target.value)}
                    required
                    placeholder="Nombre de la nueva sección"
                    className="mt-1.5"
                  />
                )}
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  Slug <span className="text-destructive ml-0.5">*</span>
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (minúsculas y guiones)
                  </span>
                </Label>
                <div className="flex items-center gap-1.5">
                  {activeSection && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {activeSection.toLowerCase().replace(/\s+/g, "-")}/
                    </span>
                  )}
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    required
                    placeholder="mi-documento"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="flex items-center gap-1.5">
                  <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" />
                  Descripción corta
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (búsqueda y tarjetas)
                  </span>
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del documento…"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label htmlFor="tags" className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Tags
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (separados por coma)
                  </span>
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="docker, cli, devops"
                />
              </div>

              {/* Orden */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <ListOrdered className="h-3.5 w-3.5 text-muted-foreground" />
                  Orden en la sección
                </Label>
                <Select value={order} onValueChange={setOrder}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Posición" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        Posición {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Columna derecha (60%) — Editor Markdown ── */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
                  Contenido Markdown{" "}
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => imageRef.current?.click()}
                    disabled={uploadingImage}
                    className="h-7 gap-1.5 text-xs text-muted-foreground cursor-pointer"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ImageIcon className="h-3.5 w-3.5" />
                    )}
                    Subir imagen
                  </Button>
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    className="h-7 gap-1.5 text-xs text-muted-foreground cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Cargar .md
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".md,.markdown,text/markdown"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreview((p) => !p)}
                    className="h-7 gap-1.5 text-xs text-muted-foreground cursor-pointer"
                  >
                    {preview ? (
                      <><EyeOff className="h-3.5 w-3.5" /> Editor</>
                    ) : (
                      <><Eye className="h-3.5 w-3.5" /> Vista previa</>
                    )}
                  </Button>
                </div>
              </div>

              {!preview && (
                <div className="flex items-center gap-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                  <span>
                    Para insertar imágenes o capturas:{" "}
                    <kbd className="rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-1 py-0.5 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                      Ctrl+V
                    </kbd>
                    {" "}con la captura en el portapapeles, o usa el botón{" "}
                    <button
                      type="button"
                      onClick={() => imageRef.current?.click()}
                      className="underline underline-offset-2 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      Subir imagen
                    </button>
                    .
                  </span>
                </div>
              )}

              {preview ? (
                <div className="flex-1 rounded-lg border border-border bg-card p-4 overflow-y-auto" style={{ minHeight: 520 }}>
                  {content ? (
                    <Markdown content={content} className="text-sm" />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin contenido todavía…</p>
                  )}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  required
                  placeholder={`# Título del documento\n\nEscribe o pega tu Markdown aquí…\n\n## Sección\n\nContenido...`}
                  className="flex-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors resize-none"
                  style={{ minHeight: 520 }}
                />
              )}

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0" />
                {content
                  ? `${content.length.toLocaleString()} caracteres · ${(new Blob([content]).size / 1024).toFixed(1)} KB`
                  : "Escribe Markdown, carga un .md, sube una imagen o pega una captura con Ctrl+V"}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Se guardará en GitHub y será visible de inmediato.
            </p>
            <Button type="submit" disabled={loading} className="gap-2 cursor-pointer disabled:cursor-not-allowed">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Publicar documento
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
