// ============================================================
//  app/api/docs/history/restore/route.ts
//  POST – Restaura el contenido de un documento a una versión
//         anterior de su historial (como un commit nuevo, no
//         reescribe historia).
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFileContentAtRef, upsertFile } from "@/lib/github";
import { findItemBySlug, getDocsIndex, slugToPath } from "@/lib/docs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { slug?: string; sha?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { slug, sha } = body;

  if (!slug || !sha) {
    return NextResponse.json(
      { error: "slug y sha son obligatorios" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9-/]+$/.test(slug) || !/^[a-f0-9]{7,40}$/i.test(sha)) {
    return NextResponse.json(
      { error: "slug o sha inválido" },
      { status: 400 }
    );
  }

  try {
    const currentIndex = await getDocsIndex();
    const targetItem = findItemBySlug(currentIndex, slug);

    if (
      targetItem &&
      targetItem.createdBy &&
      targetItem.createdBy !== session.username
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para restaurar este documento" },
        { status: 403 }
      );
    }

    const path = slugToPath(slug);

    const oldVersion = await getFileContentAtRef(path, sha);

    if (!oldVersion) {
      return NextResponse.json(
        { error: "No se encontró esa versión del documento" },
        { status: 404 }
      );
    }

    await upsertFile(
      path,
      oldVersion.content,
      `revert: restore ${slug} to ${sha.slice(0, 7)} [admin panel]`
    );

    return NextResponse.json({ ok: true, slug, restoredFrom: sha });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json(
      { error: `No se pudo restaurar: ${msg}` },
      { status: 500 }
    );
  }
}
