// ============================================================
//  app/api/docs/delete/route.ts
//  DELETE  –  Elimina un .md, sus imágenes internas y lo quita
//              del index.json. Requiere sesión admin activa.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteFile, getFileContent, upsertFile } from "@/lib/github";
import { deleteIndexItem, slugToPath } from "@/lib/docs";

// ── Extrae rutas de imágenes del repo desde un .md ──────────
// Busca tanto Markdown ![alt](url) como etiquetas <img src="url">
// y filtra solo las que pertenecen al repo (docs/images/).
function extractRepoImagePaths(content: string): string[] {
  const owner  = process.env.GITHUB_OWNER ?? "";
  const repo   = process.env.GITHUB_REPO ?? "";
  const branch = process.env.GITHUB_BRANCH ?? "main";

  // Prefijo raw que usan las imágenes subidas desde el admin
  const rawPrefix = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;

  const paths = new Set<string>();

  // Regex para ![alt](url) y <img src="url">
  const patterns = [
    /!\[[^\]]*\]\(([^)]+)\)/g,
    /<img[^>]+src=["']([^"']+)["']/gi,
  ];

  for (const regex of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const url = match[1].trim();
      if (url.startsWith(rawPrefix)) {
        // Convierte la URL completa en ruta relativa del repo
        const repoPath = url.slice(rawPrefix.length);
        // Solo borramos imágenes dentro de docs/images/ para no romper nada más
        if (repoPath.startsWith("docs/images/")) {
          paths.add(repoPath);
        }
      }
    }
  }

  return Array.from(paths);
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  // ── 1. Autenticación ────────────────────────────────────────
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // ── 2. Leer body ────────────────────────────────────────────
  let body: { slug?: string };
  try {
    body = (await req.json()) as { slug?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { slug } = body;

  if (!slug) {
    return NextResponse.json(
      { error: "El campo slug es obligatorio" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9-/]+$/.test(slug)) {
    return NextResponse.json(
      { error: "slug inválido" },
      { status: 400 }
    );
  }

  try {
    const path = slugToPath(slug);

    // ── 3. Leer el contenido del .md antes de borrarlo ─────
    const file = await getFileContent(path);
    const imagePaths = file ? extractRepoImagePaths(file.content) : [];

    // ── 4. Eliminar el .md del repo ─────────────────────────
    await deleteFile(path, `docs: eliminar ${slug} [admin panel]`);

    // ── 5. Eliminar imágenes internas referenciadas ─────────
    const deletedImages: string[] = [];
    const skippedImages: string[] = [];

    await Promise.allSettled(
      imagePaths.map(async (imgPath) => {
        try {
          await deleteFile(
            imgPath,
            `docs: eliminar imagen de ${slug} [admin panel]`
          );
          deletedImages.push(imgPath);
        } catch {
          // La imagen puede haber sido eliminada antes o compartirse con otro doc
          skippedImages.push(imgPath);
        }
      })
    );

    // ── 6. Actualizar index.json ────────────────────────────
    const newIndex = await deleteIndexItem(slug);

    await upsertFile(
      "index.json",
      JSON.stringify(newIndex, null, 2),
      `docs: eliminar ${slug} del índice [admin panel]`
    );

    return NextResponse.json({
      ok: true,
      slug,
      deletedImages,
      skippedImages,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json(
      { error: `No se pudo eliminar: ${msg}` },
      { status: 500 }
    );
  }
}

