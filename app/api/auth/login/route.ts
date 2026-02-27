// ============================================================
//  app/api/auth/login/route.ts
//  POST – Verifica credenciales y setea cookie de sesión
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { username: string; password: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Usuario y contraseña son requeridos" },
      { status: 400 }
    );
  }

  const valid = await verifyCredentials(username, password);
  if (!valid) {
    return NextResponse.json(
      { error: "Credenciales incorrectas" },
      { status: 401 }
    );
  }

  const token = await createSession(username);

  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  return res;
}
