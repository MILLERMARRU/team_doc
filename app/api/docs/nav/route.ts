// ============================================================
//  app/api/docs/nav/route.ts
//  GET – Devuelve el index.json desde GitHub (con ISR caché)
// ============================================================

import { NextResponse } from "next/server";
import { getDocsIndex } from "@/lib/docs";

export const revalidate = 120; // ISR: revalidar cada 2 minutos

export async function GET(): Promise<NextResponse> {
  try {
    const index = await getDocsIndex();
    return NextResponse.json(index);
  } catch (err: unknown) {
    console.error("[nav] error:", err);
    return NextResponse.json(
      { error: "No se pudo cargar la navegación" },
      { status: 500 }
    );
  }
}
