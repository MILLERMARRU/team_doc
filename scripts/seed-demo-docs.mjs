#!/usr/bin/env node
// ============================================================
//  scripts/seed-demo-docs.mjs
//  Crea contenido de ejemplo en tu repo de docs de GitHub para
//  no arrancar con el sitio vacío después del setup inicial.
//
//  Uso:  npm run seed-demo
//
//  Requiere las mismas variables que la app: GITHUB_TOKEN,
//  GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH (ver .env.example).
//  Es IDEMPOTENTE: si el índice ya tiene la sección "Bienvenida",
//  no la duplica.
// ============================================================

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { Octokit } from "@octokit/rest";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH = "main" } =
  process.env;

if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
  console.error(
    "❌  Faltan GITHUB_TOKEN, GITHUB_OWNER o GITHUB_REPO en .env.local.\n" +
      "    Configúralos primero (ver README.md, sección 'Configuración inicial')."
  );
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const DEMO_MD_PATH = "docs/bienvenida/primeros-pasos.md";
const DEMO_MD_CONTENT = `# Primeros pasos

¡Bienvenido a tu DocHubs! Este documento de ejemplo fue creado por
\`npm run seed-demo\` para que veas el flujo completo antes de escribir
tu propio contenido.

## Cómo editar

1. Entra a \`/admin\` con tu usuario.
2. Edita este documento o crea uno nuevo.
3. Guarda: el cambio se publica como un commit real en este repo.

## Por qué GitHub como storage

- Cada edición queda versionada, con diff y autor.
- Puedes revertir cualquier cambio como cualquier otro commit.
- No hay base de datos que mantener ni migrar.

Cuando ya no lo necesites, borra este documento desde \`/admin\`.
`;

async function getFileSha(path) {
  try {
    const res = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      ref: GITHUB_BRANCH,
    });
    return Array.isArray(res.data) ? null : res.data.sha;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function upsertFile(path, content, message) {
  const sha = await getFileSha(path);
  await octokit.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {}),
  });
}

async function main() {
  console.log(`📦  Sembrando demo en ${GITHUB_OWNER}/${GITHUB_REPO}@${GITHUB_BRANCH}...`);

  let index = { sections: [] };
  const existingSha = await getFileSha("index.json");
  if (existingSha) {
    const res = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: "index.json",
      ref: GITHUB_BRANCH,
    });
    index = JSON.parse(Buffer.from(res.data.content, "base64").toString("utf-8"));
  }

  const alreadySeeded = index.sections.some((s) => s.title === "Bienvenida");
  if (alreadySeeded) {
    console.log("✅  El índice ya tiene la sección 'Bienvenida', no se duplica. Nada que hacer.");
    return;
  }

  index.sections.push({
    title: "Bienvenida",
    order: 0,
    items: [
      {
        title: "Primeros pasos",
        slug: "bienvenida/primeros-pasos",
        path: DEMO_MD_PATH,
        order: 1,
        description: "Documento de ejemplo generado por seed-demo",
      },
    ],
  });

  await upsertFile(DEMO_MD_PATH, DEMO_MD_CONTENT, "docs: seed demo content (primeros-pasos)");
  await upsertFile(
    "index.json",
    JSON.stringify(index, null, 2) + "\n",
    "docs: seed index.json with demo section"
  );

  console.log("✅  Demo sembrada. Visita /docs/bienvenida/primeros-pasos en tu sitio.");
}

main().catch((err) => {
  console.error("❌  Error sembrando el demo:", err.message ?? err);
  process.exit(1);
});
