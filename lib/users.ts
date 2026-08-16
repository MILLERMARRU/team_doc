// ============================================================
//  lib/users.ts  –  usuarios admin persistidos en el repo de GitHub
//  Mismo patrón que index.json en lib/docs.ts: users.json vive en
//  la raíz del repo de docs configurado (GITHUB_OWNER/GITHUB_REPO).
// ============================================================

import { getFileContent, isRepoPrivate, upsertFile } from "./github";
import type { SafeUser, UserRecord } from "@/types";

const USERS_PATH = "users.json";

// ── Leer usuarios desde el repo (users.json) ──────────────────

export async function getUsersFromRepo(): Promise<UserRecord[]> {
  const file = await getFileContent(USERS_PATH);
  if (!file) return [];

  try {
    const parsed = JSON.parse(file.content);
    return Array.isArray(parsed) ? (parsed as UserRecord[]) : [];
  } catch {
    return [];
  }
}

// ── Versión segura para exponer en la UI (sin passwordHash) ──

export function toSafeUser(user: UserRecord): SafeUser {
  return {
    username: user.username,
    role: user.role ?? "admin",
    createdBy: user.createdBy,
    createdAt: user.createdAt,
  };
}

// ── Crear un usuario nuevo en el repo ──────────────────────────

export async function createUserInRepo(params: {
  username: string;
  passwordHash: string;
  role: "admin" | "editor";
  createdBy: string;
}): Promise<void> {
  // Los hashes de contraseña no deben terminar en un repo público.
  const isPrivate = await isRepoPrivate();
  if (!isPrivate) {
    throw new Error(
      "El repo de docs configurado (GITHUB_REPO) es público. No se pueden " +
        "guardar credenciales de usuarios ahí. Hazlo privado antes de crear usuarios."
    );
  }

  const users = await getUsersFromRepo();

  if (
    users.some(
      (u) => u.username.toLowerCase() === params.username.toLowerCase()
    )
  ) {
    throw new Error(`Ya existe un usuario con el username "${params.username}"`);
  }

  users.push({
    username: params.username,
    passwordHash: params.passwordHash,
    role: params.role,
    createdBy: params.createdBy,
    createdAt: new Date().toISOString(),
  });

  await upsertFile(
    USERS_PATH,
    JSON.stringify(users, null, 2) + "\n",
    `chore: add user ${params.username} [admin panel]`
  );
}
