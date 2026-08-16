// ============================================================
//  app/api/docs/history/route.ts
//  GET – Lista el historial de commits de un documento .md
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listFileCommits } from "@/lib/github";
import { slugToPath } from "@/lib/docs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { error: "El parámetro slug es obligatorio" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9-/]+$/.test(slug)) {
    return NextResponse.json({ error: "slug inválido" }, { status: 400 });
  }

  try {
    const path = slugToPath(slug);
    const commits = await listFileCommits(path);
    return NextResponse.json({ commits });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json(
      { error: `No se pudo cargar el historial: ${msg}` },
      { status: 500 }
    );
  }
}
