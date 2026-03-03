// ============================================================
//  app/api/docs/delete/route.ts
//  DELETE  –  Elimina un .md del repo y lo quita del index.json
//  Requiere sesión admin activa
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteFile, upsertFile } from "@/lib/github";
import { deleteIndexItem, slugToPath } from "@/lib/docs";

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

    // ── 3. Eliminar el .md del repo ─────────────────────────
    await deleteFile(path, `docs: eliminar ${slug} [admin panel]`);

    // ── 4. Actualizar index.json ────────────────────────────
    const newIndex = await deleteIndexItem(slug);

    await upsertFile(
      "index.json",
      JSON.stringify(newIndex, null, 2),
      `docs: eliminar ${slug} del índice [admin panel]`
    );

    return NextResponse.json({ ok: true, slug });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json(
      { error: `No se pudo eliminar: ${msg}` },
      { status: 500 }
    );
  }
}

