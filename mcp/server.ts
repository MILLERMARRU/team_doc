#!/usr/bin/env node
// ============================================================
//  mcp/server.ts  –  MCP Server para DocHubs
//  Permite crear/editar/listar/eliminar docs directamente
//  desde Claude Code sin pasar por el panel admin.
// ============================================================

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import { resolve } from "path";

// ── Cargar .env.local si existe (dev local), sino usa env del sistema ─────
// __dirname disponible en CJS bundle via tsup
config({ path: resolve(__dirname, "../.env.local"), override: false });

// ══ Revalidación on-demand ═════════════════════════════════════
// Llama al endpoint /api/revalidate del sitio para invalidar caché ISR
// al instante después de cada escritura. Requiere SITE_URL y REVALIDATE_SECRET.
async function revalidateSite(slug?: string): Promise<void> {
  const siteUrl = process.env.SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!siteUrl || !secret) return; // si no están configuradas, omitir silenciosamente

  try {
    await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ slug }),
    });
  } catch {
    // no bloquear la operación si falla la revalidación
  }
}

// ══ Tipos ═════════════════════════════════════════════════════

interface DocItem {
  title: string;
  slug: string;
  path: string;
  order: number;
  tags?: string[];
  description?: string;
  createdBy?: string;
}

interface DocSection {
  title: string;
  order: number;
  items: DocItem[];
}

interface DocsIndex {
  sections: DocSection[];
}

// ══ GitHub Client ══════════════════════════════════════════════

function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN no está definido en .env.local");
  return new Octokit({ auth: token });
}

function getRepoConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  if (!owner || !repo)
    throw new Error("GITHUB_OWNER y GITHUB_REPO deben estar definidos en .env.local");
  return { owner, repo, branch };
}

async function getFileContent(
  path: string
): Promise<{ content: string; sha: string } | null> {
  try {
    const octokit = getOctokit();
    const { owner, repo, branch } = getRepoConfig();
    const response = await octokit.repos.getContent({ owner, repo, path, ref: branch });
    const data = response.data;
    if (Array.isArray(data) || data.type !== "file") return null;
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return { content, sha: data.sha };
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

async function upsertFile(
  path: string,
  content: string,
  commitMessage: string
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo, branch } = getRepoConfig();
  const existing = await getFileContent(path);
  const encodedContent = Buffer.from(content, "utf-8").toString("base64");
  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path,
    message: commitMessage,
    content: encodedContent,
    branch,
    ...(existing ? { sha: existing.sha } : {}),
  });
}

async function deleteFileFromRepo(path: string, commitMessage: string): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo, branch } = getRepoConfig();
  const existing = await getFileContent(path);
  if (!existing) throw new Error(`Archivo no encontrado en el repo: ${path}`);
  await octokit.repos.deleteFile({
    owner, repo, path,
    message: commitMessage,
    sha: existing.sha,
    branch,
  });
}

// ══ Docs Index ═════════════════════════════════════════════════

async function getDocsIndex(): Promise<DocsIndex> {
  const file = await getFileContent("index.json");
  if (!file) return { sections: [] };
  return JSON.parse(file.content) as DocsIndex;
}

function slugToPath(slug: string): string {
  return `docs/${slug}.md`;
}

// Normaliza texto a slug válido (sin tildes, lowercase, guiones)
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-/]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Extrae la primera descripción de un Markdown (primer párrafo, no heading)
function extractDescription(content: string): string {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("```") && !trimmed.startsWith(">")) {
      return trimmed.slice(0, 160);
    }
  }
  return "";
}

// Extrae tags de los headings H2 del contenido
function extractTags(content: string): string[] {
  const tags: string[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^## (.+)$/);
    if (match) tags.push(toSlug(match[1].trim()));
  }
  return tags.slice(0, 5);
}

async function upsertIndexItem(params: {
  title: string;
  section: string;
  slug: string;
  path: string;
  order?: number;
  tags?: string[];
  description?: string;
  createdBy?: string;
}): Promise<DocsIndex> {
  const index = await getDocsIndex();

  // Buscar o crear la sección automáticamente
  let section = index.sections.find(
    (s) => s.title.toLowerCase() === params.section.toLowerCase()
  );

  if (!section) {
    section = {
      title: params.section,
      order: index.sections.length + 1,
      items: [],
    };
    index.sections.push(section);
  }

  // Calcular orden automático si no se proporcionó
  const autoOrder =
    params.order ??
    (section.items.length > 0
      ? Math.max(...section.items.map((i) => i.order)) + 1
      : 1);

  // Preservar createdBy original si el ítem ya existe
  const existingIdx = section.items.findIndex((i) => i.slug === params.slug);
  const originalCreatedBy =
    existingIdx >= 0 ? section.items[existingIdx].createdBy : params.createdBy;

  const newItem: DocItem = {
    title: params.title,
    slug: params.slug,
    path: params.path,
    order: autoOrder,
    tags: params.tags,
    description: params.description,
    createdBy: originalCreatedBy,
  };

  if (existingIdx >= 0) {
    section.items[existingIdx] = newItem;
  } else {
    section.items.push(newItem);
  }

  index.sections.sort((a, b) => a.order - b.order);
  section.items.sort((a, b) => a.order - b.order);

  return index;
}

async function deleteIndexItem(slug: string): Promise<DocsIndex> {
  const index = await getDocsIndex();
  for (const section of index.sections) {
    section.items = section.items.filter((i) => i.slug !== slug);
  }
  index.sections = index.sections.filter((s) => s.items.length > 0);
  return index;
}

// ══ MCP Server ═════════════════════════════════════════════════

const server = new Server(
  { name: "dochubs-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ── Lista de tools disponibles ────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_doc",
      description:
        "Crea un nuevo documento en DocHubs. Auto-genera sección, slug, descripción, tags y orden si no se proporcionan. Si la sección no existe, la crea automáticamente.",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Título del documento (obligatorio)",
          },
          content: {
            type: "string",
            description: "Contenido completo en Markdown (obligatorio)",
          },
          section: {
            type: "string",
            description:
              "Nombre de la sección (ej: 'proyectos'). Se crea si no existe. Si no se provee, se infiere del slug o se usa 'general'.",
          },
          slug: {
            type: "string",
            description:
              "Slug URL (ej: 'proyectos/peres'). Si no se provee, se genera como sección/título.",
          },
          description: {
            type: "string",
            description:
              "Descripción corta (máx 160 chars). Si no se provee, se extrae del primer párrafo.",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description:
              "Lista de tags. Si no se proveen, se extraen de los headings H2 del contenido.",
          },
          order: {
            type: "number",
            description: "Orden en la sección. Por defecto: último+1 automático.",
          },
          username: {
            type: "string",
            description: "Usuario que crea el doc (miller o sam). Por defecto: miller.",
          },
        },
        required: ["title", "content"],
      },
    },
    {
      name: "update_doc",
      description: "Actualiza un documento existente en DocHubs por su slug.",
      inputSchema: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "Slug del documento a actualizar (obligatorio)",
          },
          content: { type: "string", description: "Nuevo contenido Markdown" },
          title: { type: "string", description: "Nuevo título" },
          description: { type: "string", description: "Nueva descripción" },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Nuevos tags",
          },
          username: {
            type: "string",
            description: "Usuario que actualiza (para el commit message)",
          },
        },
        required: ["slug"],
      },
    },
    {
      name: "list_docs",
      description:
        "Lista todos los documentos publicados en DocHubs, opcionalmente filtrados por sección.",
      inputSchema: {
        type: "object",
        properties: {
          section: {
            type: "string",
            description: "Filtrar por nombre de sección (búsqueda parcial, opcional)",
          },
        },
      },
    },
    {
      name: "get_doc",
      description: "Obtiene el contenido Markdown completo de un documento por su slug.",
      inputSchema: {
        type: "object",
        properties: {
          slug: { type: "string", description: "Slug del documento (ej: proyectos/peres)" },
        },
        required: ["slug"],
      },
    },
    {
      name: "delete_doc",
      description:
        "Elimina un documento de DocHubs. Solo puede eliminar docs propios (respeta createdBy).",
      inputSchema: {
        type: "object",
        properties: {
          slug: { type: "string", description: "Slug del documento a eliminar" },
          username: {
            type: "string",
            description: "Usuario que solicita la eliminación (debe coincidir con createdBy)",
          },
        },
        required: ["slug", "username"],
      },
    },
  ],
}));

// ── Handlers ──────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = args as Record<string, any>;

  try {
    // ── create_doc ────────────────────────────────────────────
    if (name === "create_doc") {
      const title: string = a.title;
      const content: string = a.content;
      const username: string = a.username ?? "miller";

      // ── Auto-inferir sección y slug ───────────────────────
      let section: string = a.section ?? "";
      let slug: string = a.slug ? toSlug(a.slug) : "";

      if (!slug && !section) {
        section = "general";
        slug = toSlug(title);
      } else if (slug && !section) {
        section = slug.includes("/") ? slug.split("/")[0] : "general";
      } else if (section && !slug) {
        slug = `${toSlug(section)}/${toSlug(title)}`;
      } else {
        slug = toSlug(slug);
        section = section.trim();
      }

      // Validar slug resultante
      if (!/^[a-z0-9-/]+$/.test(slug)) {
        return {
          content: [
            {
              type: "text",
              text: `Error: slug generado inválido "${slug}". Solo letras minúsculas, números, guiones y barras.`,
            },
          ],
          isError: true,
        };
      }

      const path = slugToPath(slug);

      // Verificar que no exista ya
      const index = await getDocsIndex();
      const alreadyExists = index.sections
        .flatMap((s) => s.items)
        .some((i) => i.slug === slug);

      if (alreadyExists) {
        return {
          content: [
            {
              type: "text",
              text: `⚠️ Ya existe un documento con slug "${slug}". Usa update_doc para editarlo.`,
            },
          ],
          isError: true,
        };
      }

      // Auto-rellenar descripción y tags
      const description: string = a.description ?? extractDescription(content);
      const tags: string[] = a.tags ?? extractTags(content);

      // Persistir en GitHub
      await upsertFile(path, content, `docs: crear ${slug} via MCP [${username}]`);

      const newIndex = await upsertIndexItem({
        title,
        section,
        slug,
        path,
        order: a.order,
        tags,
        description,
        createdBy: username,
      });

      await upsertFile(
        "index.json",
        JSON.stringify(newIndex, null, 2),
        `docs: update index.json → ${slug} via MCP [${username}]`
      );

      await revalidateSite(slug);

      const sectionIsNew = !index.sections.some(
        (s) => s.title.toLowerCase() === section.toLowerCase()
      );

      return {
        content: [
          {
            type: "text",
            text: [
              `✅ Documento creado exitosamente.`,
              ``,
              `📄 **${title}**`,
              `- Sección: ${section}${sectionIsNew ? " *(nueva, creada automáticamente)*" : ""}`,
              `- Slug: \`${slug}\``,
              `- URL pública: \`/docs/${slug}\``,
              `- Descripción: ${description || "—"}`,
              `- Tags: ${tags.length ? tags.join(", ") : "—"}`,
              `- Autor: ${username}`,
            ].join("\n"),
          },
        ],
      };
    }

    // ── update_doc ────────────────────────────────────────────
    if (name === "update_doc") {
      const { slug, username = "miller" } = a;

      // Buscar doc en el index
      const index = await getDocsIndex();
      let existingItem: DocItem | null = null;
      let existingSection = "";

      for (const sec of index.sections) {
        const found = sec.items.find((i) => i.slug === slug);
        if (found) {
          existingItem = found;
          existingSection = sec.title;
          break;
        }
      }

      if (!existingItem) {
        return {
          content: [
            {
              type: "text",
              text: `Error: No se encontró el documento con slug "${slug}". Usa list_docs para ver los slugs disponibles.`,
            },
          ],
          isError: true,
        };
      }

      // Obtener contenido actual si no se provee uno nuevo
      const content: string =
        a.content ??
        (await getFileContent(existingItem.path))?.content ??
        "";

      const title: string = a.title ?? existingItem.title;
      const description: string = a.description ?? existingItem.description ?? "";
      const tags: string[] = a.tags ?? existingItem.tags ?? [];

      // Actualizar .md solo si hay nuevo contenido
      if (a.content !== undefined) {
        await upsertFile(
          existingItem.path,
          content,
          `docs: actualizar ${slug} via MCP [${username}]`
        );
      }

      // Actualizar index.json
      const newIndex = await upsertIndexItem({
        title,
        section: existingSection,
        slug,
        path: existingItem.path,
        order: existingItem.order,
        tags,
        description,
        createdBy: existingItem.createdBy,
      });

      await upsertFile(
        "index.json",
        JSON.stringify(newIndex, null, 2),
        `docs: update index.json → ${slug} via MCP [${username}]`
      );

      await revalidateSite(slug);

      return {
        content: [
          {
            type: "text",
            text: `✅ Documento actualizado.\n\n📄 **${title}**\n- Slug: \`${slug}\`\n- URL: \`/docs/${slug}\``,
          },
        ],
      };
    }

    // ── list_docs ─────────────────────────────────────────────
    if (name === "list_docs") {
      const sectionFilter: string | undefined = a.section;
      const index = await getDocsIndex();

      let sections = index.sections;
      if (sectionFilter) {
        sections = sections.filter((s) =>
          s.title.toLowerCase().includes(sectionFilter.toLowerCase())
        );
      }

      if (sections.length === 0) {
        return {
          content: [
            { type: "text", text: "No se encontraron documentos." + (sectionFilter ? ` (filtro: "${sectionFilter}")` : "") },
          ],
        };
      }

      const lines: string[] = [`# Documentos en DocHubs\n`];
      for (const section of sections) {
        lines.push(`## ${section.title} (${section.items.length} doc${section.items.length !== 1 ? "s" : ""})`);
        for (const item of section.items) {
          lines.push(`- **${item.title}** — \`${item.slug}\``);
          if (item.description) lines.push(`  *${item.description}*`);
          if (item.tags?.length) lines.push(`  Tags: \`${item.tags.join("`, `")}\``);
          if (item.createdBy) lines.push(`  Autor: ${item.createdBy}`);
        }
        lines.push("");
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }

    // ── get_doc ───────────────────────────────────────────────
    if (name === "get_doc") {
      const { slug } = a;

      const index = await getDocsIndex();
      let item: DocItem | null = null;

      for (const section of index.sections) {
        const found = section.items.find((i) => i.slug === slug);
        if (found) {
          item = found;
          break;
        }
      }

      if (!item) {
        return {
          content: [
            {
              type: "text",
              text: `Error: No se encontró el documento "${slug}". Usa list_docs para ver slugs disponibles.`,
            },
          ],
          isError: true,
        };
      }

      const file = await getFileContent(item.path);
      if (!file) {
        return {
          content: [
            {
              type: "text",
              text: `Error: El .md de "${slug}" no existe en el repo (path: ${item.path}).`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `# ${item.title}\n> Slug: \`${slug}\` | Autor: ${item.createdBy ?? "—"}\n\n---\n\n${file.content}`,
          },
        ],
      };
    }

    // ── delete_doc ────────────────────────────────────────────
    if (name === "delete_doc") {
      const { slug, username } = a;

      const index = await getDocsIndex();
      let item: DocItem | null = null;

      for (const section of index.sections) {
        const found = section.items.find((i) => i.slug === slug);
        if (found) {
          item = found;
          break;
        }
      }

      if (!item) {
        return {
          content: [
            {
              type: "text",
              text: `Error: No se encontró el documento "${slug}".`,
            },
          ],
          isError: true,
        };
      }

      // Verificar ownership
      if (item.createdBy && item.createdBy !== username) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Sin permisos: "${slug}" fue creado por "${item.createdBy}", no por "${username}".`,
            },
          ],
          isError: true,
        };
      }

      // Eliminar .md del repo
      await deleteFileFromRepo(
        item.path,
        `docs: eliminar ${slug} via MCP [${username}]`
      );

      // Actualizar index.json
      const newIndex = await deleteIndexItem(slug);
      await upsertFile(
        "index.json",
        JSON.stringify(newIndex, null, 2),
        `docs: update index.json → eliminar ${slug} via MCP [${username}]`
      );

      await revalidateSite(slug);

      return {
        content: [
          {
            type: "text",
            text: `✅ Documento "${slug}" eliminado correctamente.`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: `Tool desconocida: ${name}` }],
      isError: true,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `❌ Error interno: ${message}` }],
      isError: true,
    };
  }
});

// ── Iniciar servidor ──────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DocHubs MCP Server iniciado ✅");
}

main().catch((err) => {
  console.error("Error fatal al iniciar el MCP server:", err);
  process.exit(1);
});
