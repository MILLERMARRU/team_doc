#!/usr/bin/env node
// ============================================================
//  scripts/create-first-admin.mjs
//  Crea el primer usuario admin directamente en users.json del
//  repo de CREDENCIALES (separado del repo de docs, que puede ser
//  público). No hay forma de usar la UI de /admin sin ya tener
//  una sesión de admin. Este script rompe ese círculo.
//
//  Uso:
//    node scripts/create-first-admin.mjs <username> <password> [role]
//
//  role es opcional, por defecto "admin". Requiere GITHUB_TOKEN
//  (mismo token que la app, con acceso a ambos repos) más
//  CREDENTIALS_GITHUB_OWNER, CREDENTIALS_GITHUB_REPO,
//  CREDENTIALS_GITHUB_BRANCH (ver .env.example).
//
//  Ese repo de credenciales debe ser PRIVADO: el script se niega a
//  escribir contraseñas en un repo público.
// ============================================================

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { Octokit } from "@octokit/rest";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const [, , username, password, roleArg] = process.argv;
const role = roleArg === "editor" ? "editor" : "admin";

if (!username || !password) {
  console.error(
    "❌  Uso: node scripts/create-first-admin.mjs <username> <password> [role]"
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("❌  La contraseña debe tener al menos 8 caracteres.");
  process.exit(1);
}

const { GITHUB_TOKEN, CREDENTIALS_GITHUB_OWNER, CREDENTIALS_GITHUB_REPO } =
  process.env;
const CREDENTIALS_GITHUB_BRANCH = process.env.CREDENTIALS_GITHUB_BRANCH ?? "main";

if (!GITHUB_TOKEN || !CREDENTIALS_GITHUB_OWNER || !CREDENTIALS_GITHUB_REPO) {
  console.error(
    "❌  Faltan GITHUB_TOKEN, CREDENTIALS_GITHUB_OWNER o CREDENTIALS_GITHUB_REPO en .env.local.\n" +
      "    Este repo debe ser PRIVADO y separado del repo de docs (ver README)."
  );
  process.exit(1);
}

const owner = CREDENTIALS_GITHUB_OWNER;
const repo = CREDENTIALS_GITHUB_REPO;
const branch = CREDENTIALS_GITHUB_BRANCH;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getFileSha(path) {
  try {
    const res = await octokit.repos.getContent({ owner, repo, path, ref: branch });
    return Array.isArray(res.data) ? null : res.data.sha;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function main() {
  const { data: repoData } = await octokit.repos.get({ owner, repo });

  if (!repoData.private) {
    console.error(
      "❌  El repo CREDENTIALS_GITHUB_OWNER/CREDENTIALS_GITHUB_REPO configurado es público.\n" +
        "    No se pueden guardar credenciales de usuarios ahí. Hazlo privado primero."
    );
    process.exit(1);
  }

  let users = [];
  const existingSha = await getFileSha("users.json");
  if (existingSha) {
    const res = await octokit.repos.getContent({
      owner,
      repo,
      path: "users.json",
      ref: branch,
    });
    users = JSON.parse(Buffer.from(res.data.content, "base64").toString("utf-8"));
  }

  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    console.error(`❌  Ya existe un usuario con el username "${username}".`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  users.push({
    username,
    passwordHash,
    role,
    createdBy: "bootstrap-script",
    createdAt: new Date().toISOString(),
  });

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: "users.json",
    message: `chore: create first admin user (${username}) [bootstrap]`,
    content: Buffer.from(JSON.stringify(users, null, 2) + "\n", "utf-8").toString(
      "base64"
    ),
    branch,
    ...(existingSha ? { sha: existingSha } : {}),
  });

  console.log(`✅  Usuario "${username}" (role: ${role}) creado en ${owner}/${repo}.`);
  console.log("   Ya puedes entrar a /admin/login con esas credenciales.");
}

main().catch((err) => {
  console.error("❌  Error creando el usuario:", err.message ?? err);
  process.exit(1);
});
