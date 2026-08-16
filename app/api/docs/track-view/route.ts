// ============================================================
//  app/api/docs/track-view/route.ts
//  POST – Incrementa el contador de vistas de un doc. Pública
//         (la llama cualquier visitante de /docs/[slug]), sin auth.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { trackView } from "@/lib/analytics";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { slug } = body;
  if (!slug || !/^[a-z0-9-/]+$/.test(slug)) {
    return NextResponse.json({ error: "slug inválido" }, { status: 400 });
  }

  try {
    await trackView(slug);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    // No queremos que un error de Redis rompa la experiencia de lectura
    // de docs. Se loguea server-side y se responde 200 igual.
    console.error("[track-view] error:", err);
    return NextResponse.json({ ok: false });
  }
}
