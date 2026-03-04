// ============================================================
//  lib/docs.ts  –  utilidades para leer y procesar docs
// ============================================================

import { getFileContent } from "./github";
import type { DocsIndex, DocItem } from "@/types";
import GithubSlugger from "github-slugger";

const INDEX_PATH = "index.json";

// ── Leer index.json desde GitHub (con caché ISR) ─────────────

export async function getDocsIndex(): Promise<DocsIndex> {
  const isPrivate = !!process.env.GITHUB_TOKEN;

  let raw: string | null = null;

  if (isPrivate) {
    // Repo privado → API con token
    const file = await getFileContent(INDEX_PATH);
    raw = file?.content ?? null;
  } else {
    // Repo público → raw.githubusercontent.com
    const { owner, repo, branch } = {
      owner: process.env.GITHUB_OWNER ?? "",
      repo: process.env.GITHUB_REPO ?? "",
      branch: process.env.GITHUB_BRANCH ?? "main",
    };
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${INDEX_PATH}`;
    const res = await fetch(url, { next: { revalidate: 120 } });
    raw = res.ok ? await res.text() : null;
  }

  if (!raw) {
    // Si el index aún no existe devolvemos uno vacío
    return { sections: [] };
  }

  return JSON.parse(raw) as DocsIndex;
}

// ── Buscar un DocItem por slug ────────────────────────────────

export function findItemBySlug(
  index: DocsIndex,
  slug: string
): DocItem | null {
  for (const section of index.sections) {
    const item = section.items.find((i) => i.slug === slug);
    if (item) return item;
  }
  return null;
}

// ── Leer el contenido .md de un doc por slug ─────────────────

export async function getDocContent(slug: string): Promise<string | null> {
  const index = await getDocsIndex();
  const item = findItemBySlug(index, slug);
  if (!item) return null;

  const file = await getFileContent(item.path);
  return file?.content ?? null;
}

// ── Actualizar index.json añadiendo o actualizando un ítem ───

export async function upsertIndexItem(params: {
  title: string;
  section: string;
  slug: string;
  path: string;
  order: number;
  tags?: string[];
  description?: string;
  createdBy?: string;
}): Promise<DocsIndex> {
  const index = await getDocsIndex();

  // Buscar o crear la sección
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

  // Buscar o crear el ítem
  const existingIdx = section.items.findIndex((i) => i.slug === params.slug);

  // Preservar el createdBy original si el ítem ya existe
  const originalCreatedBy =
    existingIdx >= 0 ? section.items[existingIdx].createdBy : params.createdBy;

  const newItem: import("@/types").DocItem = {
    title: params.title,
    slug: params.slug,
    path: params.path,
    order: params.order,
    tags: params.tags,
    description: params.description,
    createdBy: originalCreatedBy,
  };

  if (existingIdx >= 0) {
    section.items[existingIdx] = newItem;
  } else {
    section.items.push(newItem);
  }

  // Reordenar
  index.sections.sort((a, b) => a.order - b.order);
  section.items.sort((a, b) => a.order - b.order);

  return index;
}

// ── Extraer headings de Markdown para el TOC ─────────────────

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const lines = markdown.split("\n");
  const items: TocItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].replace(/`([^`]+)`/g, "$1").trim();
    const id = slugger.slug(text);

    items.push({ id, text, level });
  }

  return items;
}

// ── Calcular path desde slug ──────────────────────────────────

export function slugToPath(slug: string): string {
  return `docs/${slug}.md`;
}

// ── Eliminar un ítem del index.json ───────────────────────────

export async function deleteIndexItem(slug: string): Promise<DocsIndex> {
  const index = await getDocsIndex();

  for (const section of index.sections) {
    section.items = section.items.filter((i) => i.slug !== slug);
  }

  // Eliminar secciones vacías
  index.sections = index.sections.filter((s) => s.items.length > 0);

  return index;
}
