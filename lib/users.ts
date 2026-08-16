// ============================================================
//  lib/users.ts  –  usuarios admin persistidos en un repo de GitHub
//  APARTE del repo de docs (CREDENTIALS_GITHUB_OWNER/REPO): el repo
//  de docs puede ser público, y los hashes de contraseña no deben
//  terminar ahí. users.json vive en la raíz de ese repo separado,
//  que debe ser privado.
// ============================================================

import { getCredentialsRepoConfig, getFileContent, isRepoPrivate, upsertFile } from "./github";
import type { SafeUser, UserRecord } from "@/types";

const USERS_PATH = "users.json";

// ── Leer usuarios desde el repo de credenciales (users.json) ──

export async function getUsersFromRepo(): Promise<UserRecord[]> {
  const repoRef = getCredentialsRepoConfig();
  const file = await getFileContent(USERS_PATH, repoRef);
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
  const repoRef = getCredentialsRepoConfig();

  // Los hashes de contraseña no deben terminar en un repo público.
  const isPrivate = await isRepoPrivate(repoRef);
  if (!isPrivate) {
    throw new Error(
      "El repo de credenciales configurado (CREDENTIALS_GITHUB_REPO) es " +
        "público. No se pueden guardar credenciales de usuarios ahí. " +
        "Hazlo privado antes de crear usuarios."
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
    `chore: add user ${params.username} [admin panel]`,
    repoRef
  );
}
