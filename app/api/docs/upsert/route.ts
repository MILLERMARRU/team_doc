// ============================================================
//  app/api/docs/upsert/route.ts
//  POST  – Crea o actualiza un documento en GitHub
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { upsertFile } from "@/lib/github";
import { upsertIndexItem, slugToPath, getDocsIndex, findItemBySlug } from "@/lib/docs";
import type { UpsertDocBody } from "@/types";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Autenticación ────────────────────────────────────────
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // ── 2. Leer y validar body ──────────────────────────────────
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BYTES) {
    return NextResponse.json(
      { error: "Payload demasiado grande (máx. 2MB)" },
      { status: 413 }
    );
  }

  let body: UpsertDocBody;
  try {
    body = (await req.json()) as UpsertDocBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { title, section, slug, content, order = 1, tags, description } = body;

  if (!title || !section || !slug || !content) {
    return NextResponse.json(
      { error: "title, section, slug y content son obligatorios" },
      { status: 400 }
    );
  }

  // Validar formato del slug
  if (!/^[a-z0-9-/]+$/.test(slug)) {
    return NextResponse.json(
      {
        error:
          "slug solo puede contener letras minúsculas, números, guiones y barras",
      },
      { status: 400 }
    );
  }

  try {
    const path = slugToPath(slug);

    // ── 3. Guardar el .md en GitHub ────────────────────────────
    await upsertFile(
      path,
      content,
      `docs: upsert ${slug} [admin panel]`
    );

    // ── 4. Actualizar index.json en GitHub ─────────────────────
    const newIndex = await upsertIndexItem({
      title,
      section,
      slug,
      path,
      order,
      tags,
      description,
      createdBy: session.username,
    });

    await upsertFile(
      "index.json",
      JSON.stringify(newIndex, null, 2),
      `docs: update index.json → ${slug} [admin panel]`
    );

    return NextResponse.json({ ok: true, slug, path });
  } catch (err: unknown) {
    console.error("[upsert] error:", err);
    return NextResponse.json(
      { error: "Error al guardar en GitHub. Revisa los logs del servidor." },
      { status: 500 }
    );
  }
}
