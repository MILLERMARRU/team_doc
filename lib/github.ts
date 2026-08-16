// ============================================================
//  lib/github.ts  –  cliente GitHub API (solo servidor)
//  Usa la API REST de GitHub para leer y escribir archivos.
// ============================================================

import { Octokit } from "@octokit/rest";

// Singleton para reutilizar la misma instancia
let _octokit: Octokit | null = null;

function getOctokit(): Octokit {
  if (!_octokit) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN no está definido en .env.local");
    _octokit = new Octokit({ auth: token });
  }
  return _octokit;
}

export interface RepoRef {
  owner: string;
  repo: string;
  branch: string;
}

function getRepoConfig(): RepoRef {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  if (!owner || !repo) {
    throw new Error(
      "GITHUB_OWNER y GITHUB_REPO deben estar definidos en .env.local"
    );
  }
  return { owner, repo, branch };
}

// ── Repo separado para credenciales (users.json) ──────────────
// Deliberadamente distinto de GITHUB_OWNER/REPO: ese repo puede ser
// público (p. ej. un repo de docs con estrellas), y los hashes de
// contraseña no deben terminar ahí. Usa el mismo GITHUB_TOKEN, así
// que el PAT debe tener acceso a ambos repos.

export function getCredentialsRepoConfig(): RepoRef {
  const owner = process.env.CREDENTIALS_GITHUB_OWNER;
  const repo = process.env.CREDENTIALS_GITHUB_REPO;
  const branch = process.env.CREDENTIALS_GITHUB_BRANCH ?? "main";
  if (!owner || !repo) {
    throw new Error(
      "CREDENTIALS_GITHUB_OWNER y CREDENTIALS_GITHUB_REPO deben estar " +
        "definidos en .env.local (repo PRIVADO separado para users.json)"
    );
  }
  return { owner, repo, branch };
}

// ── Leer un archivo del repo ─────────────────────────────────

export async function getFileContent(
  path: string,
  repoRef?: RepoRef
): Promise<{ content: string; sha: string } | null> {
  try {
    const octokit = getOctokit();
    const { owner, repo, branch } = repoRef ?? getRepoConfig();

    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    const data = response.data;
    if (Array.isArray(data) || data.type !== "file") return null;

    // El contenido viene en Base64
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return { content, sha: data.sha };
  } catch (err: unknown) {
    // 404 = archivo no existe todavía
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

// ── Crear o actualizar un archivo del repo ───────────────────

export async function upsertFile(
  path: string,
  content: string,
  commitMessage: string,
  repoRef?: RepoRef
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo, branch } = repoRef ?? getRepoConfig();

  // Necesitamos el SHA si el archivo ya existe (para actualizarlo)
  const existing = await getFileContent(path, repoRef);

  const encodedContent = Buffer.from(content, "utf-8").toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: commitMessage,
    content: encodedContent,
    branch,
    ...(existing ? { sha: existing.sha } : {}),
  });
}

// ── Leer archivo raw sin autenticación (repos públicos) ──────

export async function getRawPublicFile(path: string): Promise<string | null> {
  const { owner, repo, branch } = getRepoConfig();
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

  const res = await fetch(url, { next: { revalidate: 120 } });
  if (!res.ok) return null;
  return res.text();
}

// ── Obtener solo el SHA de un archivo (para updates de binarios) ─────────────

export async function getFileSha(path: string): Promise<string | null> {
  try {
    const octokit = getOctokit();
    const { owner, repo, branch } = getRepoConfig();

    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    const data = response.data;
    if (Array.isArray(data) || data.type !== "file") return null;
    return data.sha;
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

// ── Subir archivo binario como Base64 (imágenes) ─────────────────────────────

export async function upsertBinaryFile(
  path: string,
  base64Content: string,
  commitMessage: string
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo, branch } = getRepoConfig();

  // Si ya existe, necesitamos el SHA para actualizarlo
  const sha = await getFileSha(path);

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: commitMessage,
    content: base64Content,
    branch,
    ...(sha ? { sha } : {}),
  });
}

// ── Eliminar un archivo del repo ─────────────────────────────────────────────

export async function deleteFile(
  path: string,
  commitMessage: string
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo, branch } = getRepoConfig();

  const sha = await getFileSha(path);
  if (!sha) throw new Error(`Archivo no encontrado en el repo: ${path}`);

  await octokit.repos.deleteFile({
    owner,
    repo,
    path,
    message: commitMessage,
    sha,
    branch,
  });
}

// ── Listar archivos de un directorio del repo ─────────────────────────────────

export async function listDirectory(
  dirPath: string
): Promise<{ name: string; path: string; type: "file" | "dir" }[]> {
  try {
    const octokit = getOctokit();
    const { owner, repo, branch } = getRepoConfig();

    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: dirPath,
      ref: branch,
    });

    const data = response.data;
    if (!Array.isArray(data)) return [];

    return data.map((entry) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type as "file" | "dir",
    }));
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) return [];
    throw err;
  }
}

// ── Saber si el repo configurado es privado ───────────────────────────────
// Usado para bloquear la escritura de credenciales (users.json) en repos
// públicos: los hashes de contraseña no deben quedar expuestos.

export async function isRepoPrivate(repoRef?: RepoRef): Promise<boolean> {
  const octokit = getOctokit();
  const { owner, repo } = repoRef ?? getRepoConfig();

  const { data } = await octokit.repos.get({ owner, repo });
  return !!data.private;
}

// ── Construir URL pública raw.githubusercontent.com ──────────────────────────

export function buildRawUrl(path: string): string {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  if (!owner || !repo) {
    throw new Error("GITHUB_OWNER y GITHUB_REPO deben estar definidos en .env.local");
  }
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}
