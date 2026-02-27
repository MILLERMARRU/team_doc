// ============================================================
//  app/api/auth/logout/route.ts
//  POST – Elimina la cookie de sesión
// ============================================================

import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
