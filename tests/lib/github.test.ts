import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getContent } = vi.hoisted(() => ({ getContent: vi.fn() }));

vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn().mockImplementation(function MockOctokit() {
    return { repos: { getContent } };
  }),
}));

import { buildRawUrl, getFileContent } from "@/lib/github";

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
