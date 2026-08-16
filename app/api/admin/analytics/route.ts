// ============================================================
//  app/api/admin/analytics/route.ts
//  GET – Devuelve el conteo de vistas por doc. Requiere sesión.
// ============================================================

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getViewCounts } from "@/lib/analytics";

export async function GET(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const views = await getViewCounts();
    return NextResponse.json({ views });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json(
      { error: `No se pudo cargar el analytics: ${msg}` },
      { status: 500 }
    );
  }
}
