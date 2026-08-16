// ============================================================
//  lib/auth.ts  –  autenticación JSON-based con JWT
// ============================================================

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { SafeUser, SessionPayload, UserRecord, UserRole } from "@/types";
import { getUsersFromRepo, toSafeUser } from "./users";

const COOKIE_NAME = "docs_session";
const SESSION_DURATION = "8h";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no está definido en .env.local");
  return new TextEncoder().encode(secret);
}

// ── Usuarios locales (data/users.json) ───────────────────────
// Fallback de desarrollo: el archivo real nunca se commitea (ver
// .gitignore) y en producción (Vercel) no existe en el filesystem
// de runtime. Los usuarios "de verdad" viven en el repo de docs
// (lib/users.ts). Los locales se tratan como rol "admin" implícito
// para no romper el comportamiento previo a PR #7.

async function getLocalUsers(): Promise<UserRecord[]> {
  try {
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    const filePath = join(process.cwd(), "data", "users.json");
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as UserRecord[];
  } catch {
    // No existe (producción, o dev sin setup local todavía) → sin fallback
    return [];
  }
}

// ── Unir usuarios locales + los del repo de GitHub ────────────
// Si un mismo username existe en ambos lados, gana el del repo.

async function getAllUsers(): Promise<UserRecord[]> {
  const [local, repo] = await Promise.all([
    getLocalUsers(),
    getUsersFromRepo().catch(() => [] as UserRecord[]),
  ]);

  const merged = new Map<string, UserRecord>();
  for (const u of local) {
    merged.set(u.username.toLowerCase(), { ...u, role: u.role ?? "admin" });
  }
  for (const u of repo) {
    merged.set(u.username.toLowerCase(), u);
  }
  return [...merged.values()];
}

export async function getAllUsersSafe(): Promise<SafeUser[]> {
  const users = await getAllUsers();
  return users.map(toSafeUser);
}

// ── Verificar credenciales ───────────────────────────────────

export async function verifyCredentials(
  username: string,
  password: string
): Promise<{ ok: boolean; role: UserRole | null }> {
  const users = await getAllUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (!user) return { ok: false, role: null };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { ok: false, role: null };

  return { ok: true, role: user.role ?? "admin" };
}

// ── Crear sesión JWT ─────────────────────────────────────────

export async function createSession(
  username: string,
  role: UserRole
): Promise<string> {
  const token = await new SignJWT({ username, role } satisfies SessionPayload)
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
    const session = payload as unknown as SessionPayload;
    // Sesiones emitidas antes de PR #7 no tienen "role" en el JWT.
    return { ...session, role: session.role ?? "admin" };
  } catch {
    return null;
  }
}

// ── Nombre de la cookie de sesión (para usarla en actions) ──

export { COOKIE_NAME };
