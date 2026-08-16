// ============================================================
//  app/api/docs/history/diff/route.ts
//  GET – Devuelve el diff (patch unificado) de un documento en
//        un commit puntual de su historial.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFileDiffAtCommit } from "@/lib/github";
import { slugToPath } from "@/lib/docs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  const sha = req.nextUrl.searchParams.get("sha");

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
    const path = slugToPath(slug);
    const diff = await getFileDiffAtCommit(path, sha);
    if (!diff) {
      return NextResponse.json(
        { error: "Ese commit no modifica este documento" },
        { status: 404 }
      );
    }
    return NextResponse.json(diff);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json(
      { error: `No se pudo cargar el diff: ${msg}` },
      { status: 500 }
    );
  }
}
