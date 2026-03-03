// ============================================================
//  app/api/docs/file/route.ts
//  GET ?path=docs/xxx/yyy.md  –  Devuelve contenido de un .md
//  Requiere sesión admin activa
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFileContent } from "@/lib/github";

export async function GET(req: NextRequest): Promise<NextResponse> {
  // ── 1. Autenticación ────────────────────────────────────────
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // ── 2. Leer parámetro path ──────────────────────────────────
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "El parámetro path es obligatorio" },
      { status: 400 }
    );
  }

  // Validar que solo se lean archivos dentro de docs/
  if (!path.startsWith("docs/") || !path.endsWith(".md")) {
    return NextResponse.json(
      { error: "Solo se permiten archivos .md dentro de docs/" },
      { status: 403 }
    );
  }

  try {
    const file = await getFileContent(path);
    if (!file) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ content: file.content, sha: file.sha });
  } catch {
    return NextResponse.json(
      { error: "Error al leer el archivo de GitHub" },
      { status: 500 }
    );
  }
}
