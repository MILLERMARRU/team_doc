// ============================================================
//  app/api/admin/users/route.ts
//  GET   – lista usuarios (username, role, createdBy, createdAt)
//  POST  – crea un usuario nuevo en el repo de docs (users.json)
//  Ambas requieren sesión con role === "admin".
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAllUsersSafe, getSession } from "@/lib/auth";
import { createUserInRepo } from "@/lib/users";
import type { UserRole } from "@/types";

const VALID_ROLES: UserRole[] = ["admin", "editor"];

export async function GET(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json(
      { error: "Solo un usuario admin puede ver la lista de usuarios" },
      { status: 403 }
    );
  }

  const users = await getAllUsersSafe();
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json(
      { error: "Solo un usuario admin puede crear usuarios" },
      { status: 403 }
    );
  }

  let body: { username?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { username, password, role } = body;

  if (!username || !password || !role) {
    return NextResponse.json(
      { error: "username, password y role son obligatorios" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9_-]{3,32}$/i.test(username)) {
    return NextResponse.json(
      {
        error:
          "username inválido: solo letras, números, guiones y guion bajo (3-32 caracteres)",
      },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  if (!VALID_ROLES.includes(role as UserRole)) {
    return NextResponse.json(
      { error: `role debe ser uno de: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await createUserInRepo({
      username,
      passwordHash,
      role: role as UserRole,
      createdBy: session.username,
    });

    return NextResponse.json({ ok: true, username, role });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
