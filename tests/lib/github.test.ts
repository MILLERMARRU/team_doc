import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getContent, listCommits, getCommit } = vi.hoisted(() => ({
  getContent: vi.fn(),
  listCommits: vi.fn(),
  getCommit: vi.fn(),
}));

vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn().mockImplementation(function MockOctokit() {
    return { repos: { getContent, listCommits, getCommit } };
  }),
}));

import {
  buildRawUrl,
  getFileContent,
  getFileContentAtRef,
  getFileDiffAtCommit,
  listFileCommits,
} from "@/lib/github";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("buildRawUrl", () => {
  it("construye la URL raw.githubusercontent.com con branch por defecto", () => {
    process.env.GITHUB_OWNER = "acme";
    process.env.GITHUB_REPO = "docs-repo";
    delete process.env.GITHUB_BRANCH;

    expect(buildRawUrl("docs/intro.md")).toBe(
      "https://raw.githubusercontent.com/acme/docs-repo/main/docs/intro.md"
    );
  });

  it("respeta GITHUB_BRANCH cuando está definido", () => {
    process.env.GITHUB_OWNER = "acme";
    process.env.GITHUB_REPO = "docs-repo";
    process.env.GITHUB_BRANCH = "develop";

    expect(buildRawUrl("docs/intro.md")).toBe(
      "https://raw.githubusercontent.com/acme/docs-repo/develop/docs/intro.md"
    );
  });

  it("lanza error si falta GITHUB_OWNER o GITHUB_REPO", () => {
    delete process.env.GITHUB_OWNER;
    process.env.GITHUB_REPO = "docs-repo";

    expect(() => buildRawUrl("docs/intro.md")).toThrow();
  });
});

describe("getFileContent", () => {
  beforeEach(() => {
    getContent.mockReset();
    process.env.GITHUB_TOKEN = "fake-token";
    process.env.GITHUB_OWNER = "acme";
    process.env.GITHUB_REPO = "docs-repo";
  });

  it("retorna null cuando GitHub responde 404 (archivo no existe todavía)", async () => {
    getContent.mockRejectedValueOnce({ status: 404 });

    const result = await getFileContent("docs/no-existe.md");
    expect(result).toBeNull();
  });

  it("relanza errores distintos de 404", async () => {
    getContent.mockRejectedValueOnce({ status: 500 });

    await expect(getFileContent("docs/x.md")).rejects.toMatchObject({
      status: 500,
    });
  });

  it("decodifica el contenido Base64 y devuelve content + sha", async () => {
    getContent.mockResolvedValueOnce({
      data: {
        type: "file",
        content: Buffer.from("hola mundo", "utf-8").toString("base64"),
        sha: "sha123",
      },
    });

    const result = await getFileContent("docs/x.md");
    expect(result).toEqual({ content: "hola mundo", sha: "sha123" });
  });

  it("retorna null si la ruta es un directorio, no un archivo", async () => {
    getContent.mockResolvedValueOnce({
      data: [{ type: "file", name: "a.md" }],
    });

    const result = await getFileContent("docs/una-carpeta");
    expect(result).toBeNull();
  });
});

describe("getFileContentAtRef", () => {
  beforeEach(() => {
    getContent.mockReset();
    process.env.GITHUB_TOKEN = "fake-token";
    process.env.GITHUB_OWNER = "acme";
    process.env.GITHUB_REPO = "docs-repo";
  });

  it("pasa el sha como ref en vez del branch configurado", async () => {
    getContent.mockResolvedValueOnce({
      data: {
        type: "file",
        content: Buffer.from("versión vieja", "utf-8").toString("base64"),
        sha: "filesha",
      },
    });

    const result = await getFileContentAtRef("docs/x.md", "abc1234");

    expect(result).toEqual({ content: "versión vieja", sha: "filesha" });
    expect(getContent).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "acme", repo: "docs-repo", ref: "abc1234" })
    );
  });
});

describe("listFileCommits", () => {
  beforeEach(() => {
    listCommits.mockReset();
    process.env.GITHUB_TOKEN = "fake-token";
    process.env.GITHUB_OWNER = "acme";
    process.env.GITHUB_REPO = "docs-repo";
  });

  it("mapea los commits al shape CommitSummary", async () => {
    listCommits.mockResolvedValueOnce({
      data: [
        {
          sha: "abc1234567",
          html_url: "https://github.com/acme/docs-repo/commit/abc1234567",
          commit: {
            message: "docs: update intro",
            author: { name: "Miller", date: "2026-01-01T00:00:00Z" },
          },
        },
      ],
    });

    const result = await listFileCommits("docs/intro.md");

    expect(result).toEqual([
      {
        sha: "abc1234567",
        message: "docs: update intro",
        authorName: "Miller",
        date: "2026-01-01T00:00:00Z",
        htmlUrl: "https://github.com/acme/docs-repo/commit/abc1234567",
      },
    ]);
    expect(listCommits).toHaveBeenCalledWith(
      expect.objectContaining({ path: "docs/intro.md", per_page: 20 })
    );
  });
});

describe("getFileDiffAtCommit", () => {
  beforeEach(() => {
    getCommit.mockReset();
    process.env.GITHUB_TOKEN = "fake-token";
    process.env.GITHUB_OWNER = "acme";
    process.env.GITHUB_REPO = "docs-repo";
  });

  it("retorna el patch y status del archivo dentro del commit", async () => {
    getCommit.mockResolvedValueOnce({
      data: {
        files: [
          { filename: "docs/intro.md", status: "modified", patch: "@@ -1 +1 @@\n-a\n+b" },
          { filename: "index.json", status: "modified", patch: "@@ ..." },
        ],
      },
    });

    const result = await getFileDiffAtCommit("docs/intro.md", "abc123");

    expect(result).toEqual({ patch: "@@ -1 +1 @@\n-a\n+b", status: "modified" });
  });

  it("retorna null si el commit no tocó ese archivo", async () => {
    getCommit.mockResolvedValueOnce({
      data: { files: [{ filename: "otro-doc.md", status: "modified", patch: "..." }] },
    });

    const result = await getFileDiffAtCommit("docs/intro.md", "abc123");
    expect(result).toBeNull();
  });
});
