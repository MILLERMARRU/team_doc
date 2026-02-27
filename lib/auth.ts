// ============================================================
//  lib/auth.ts  –  autenticación JSON-based con JWT
// ============================================================

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/types";

const COOKIE_NAME = "docs_session";
const SESSION_DURATION = "8h";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no está definido en .env.local");
  return new TextEncoder().encode(secret);
}

// ── Cargamos los usuarios desde el JSON ─────────────────────

interface StoredUser {
  username: string;
  /** Contraseña hasheada con bcrypt */
  passwordHash: string;
}

export async function getUsersFromJson(): Promise<StoredUser[]> {
  // Importación dinámica para que solo corra en servidor
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  const filePath = join(process.cwd(), "data", "users.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as StoredUser[];
}

// ── Verificar credenciales ───────────────────────────────────

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const users = await getUsersFromJson();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

// ── Crear sesión JWT ─────────────────────────────────────────

export async function createSession(username: string): Promise<string> {
  const token = await new SignJWT({ username } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
  return token;
}

// ── Leer sesión desde cookie ─────────────────────────────────

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Nombre de la cookie de sesión (para usarla en actions) ──

export { COOKIE_NAME };
