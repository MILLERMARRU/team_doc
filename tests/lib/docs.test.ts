import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DocsIndex } from "@/types";

vi.mock("@/lib/github", () => ({
  getFileContent: vi.fn(),
}));

import { getFileContent } from "@/lib/github";
import {
  deleteIndexItem,
  extractToc,
  findItemBySlug,
  slugToPath,
  upsertIndexItem,
} from "@/lib/docs";

const mockedGetFileContent = vi.mocked(getFileContent);

// getDocsIndex() solo usa getFileContent() (API autenticada) cuando hay
// GITHUB_TOKEN; sin él, intenta un fetch real a raw.githubusercontent.com.
process.env.GITHUB_TOKEN = "fake-token-para-tests";

describe("findItemBySlug", () => {
  const index: DocsIndex = {
    sections: [
      {
        title: "Guides",
        order: 1,
        items: [
          {
            title: "Intro",
            slug: "guides/intro",
            path: "docs/guides/intro.md",
            order: 1,
          },
        ],
      },
    ],
  };

  it("encuentra un item existente por slug", () => {
    expect(findItemBySlug(index, "guides/intro")?.title).toBe("Intro");
  });

  it("retorna null si el slug no existe en ninguna sección", () => {
    expect(findItemBySlug(index, "no/existe")).toBeNull();
  });
});

describe("slugToPath", () => {
  it("mapea un slug al path .md dentro de docs/", () => {
    expect(slugToPath("devops/docker/build")).toBe(
      "docs/devops/docker/build.md"
    );
  });
});

describe("extractToc", () => {
  it("extrae headings con su nivel y genera ids con slug", () => {
    const md = "# Título Uno\n\nTexto\n\n## Subtítulo Dos\n";
    expect(extractToc(md)).toEqual([
      { id: "título-uno", text: "Título Uno", level: 1 },
      { id: "subtítulo-dos", text: "Subtítulo Dos", level: 2 },
    ]);
  });

  it("quita los backticks del texto del heading", () => {
    const toc = extractToc("# Usa `npm run dev`");
    expect(toc[0].text).toBe("Usa npm run dev");
  });

  it("ignora líneas que no son headings", () => {
    expect(extractToc("texto normal\nno # esto no es heading")).toEqual([]);
  });
});

describe("upsertIndexItem", () => {
  beforeEach(() => {
    mockedGetFileContent.mockReset();
  });

  it("crea una sección nueva cuando el index está vacío", async () => {
    mockedGetFileContent.mockResolvedValue(null);

    const result = await upsertIndexItem({
      title: "Intro",
      section: "Guides",
      slug: "guides/intro",
      path: "docs/guides/intro.md",
      order: 1,
      createdBy: "miller",
    });

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].title).toBe("Guides");
    expect(result.sections[0].items[0].createdBy).toBe("miller");
  });

  it("preserva el createdBy original al editar un item existente", async () => {
    const existing: DocsIndex = {
      sections: [
        {
          title: "Guides",
          order: 1,
          items: [
            {
              title: "Intro vieja",
              slug: "guides/intro",
              path: "docs/guides/intro.md",
              order: 1,
              createdBy: "sam",
            },
          ],
        },
      ],
    };
    mockedGetFileContent.mockResolvedValue({
      content: JSON.stringify(existing),
      sha: "abc123",
    });

    const result = await upsertIndexItem({
      title: "Intro actualizada",
      section: "Guides",
      slug: "guides/intro",
      path: "docs/guides/intro.md",
      order: 1,
      createdBy: "miller",
    });

    expect(result.sections[0].items[0].title).toBe("Intro actualizada");
    expect(result.sections[0].items[0].createdBy).toBe("sam");
  });
});

describe("deleteIndexItem", () => {
  afterEach(() => {
    mockedGetFileContent.mockReset();
  });

  it("elimina el item y la sección si queda vacía", async () => {
    const existing: DocsIndex = {
      sections: [
        {
          title: "Guides",
          order: 1,
          items: [
            {
              title: "Intro",
              slug: "guides/intro",
              path: "docs/guides/intro.md",
              order: 1,
            },
          ],
        },
      ],
    };
    mockedGetFileContent.mockResolvedValue({
      content: JSON.stringify(existing),
      sha: "abc123",
    });

    const result = await deleteIndexItem("guides/intro");
    expect(result.sections).toHaveLength(0);
  });
});
