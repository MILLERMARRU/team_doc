// ============================================================
//  app/api/revalidate/route.ts
//  POST – Invalida el caché ISR de una ruta de docs al instante
//  Llamado por el MCP después de crear/actualizar/eliminar un doc
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Verificar secret ─────────────────────────────────────
  const secret = req.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // ── 2. Leer slug opcional ───────────────────────────────────
  let slug: string | undefined;
  try {
    const body = await req.json();
    slug = body?.slug;
  } catch {
    // sin body está bien — revalida todo
  }

  // ── 3. Revalidar rutas ──────────────────────────────────────
  // Siempre revalidar el layout de docs (sidebar, nav)
  revalidatePath("/docs", "layout");

  // Si viene slug, revalidar también la página específica
  if (slug) {
    revalidatePath(`/docs/${slug}`);
  }

  return NextResponse.json({ ok: true, revalidated: slug ?? "layout" });
}
