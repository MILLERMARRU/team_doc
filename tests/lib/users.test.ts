import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRecord } from "@/types";

vi.mock("@/lib/github", () => ({
  getFileContent: vi.fn(),
  isRepoPrivate: vi.fn(),
  upsertFile: vi.fn(),
}));

import { getFileContent, isRepoPrivate, upsertFile } from "@/lib/github";
import { createUserInRepo, getUsersFromRepo, toSafeUser } from "@/lib/users";

const mockedGetFileContent = vi.mocked(getFileContent);
const mockedIsRepoPrivate = vi.mocked(isRepoPrivate);
const mockedUpsertFile = vi.mocked(upsertFile);

describe("getUsersFromRepo", () => {
  beforeEach(() => {
    mockedGetFileContent.mockReset();
  });

  it("retorna [] si users.json no existe todavía", async () => {
    mockedGetFileContent.mockResolvedValue(null);
    await expect(getUsersFromRepo()).resolves.toEqual([]);
  });

  it("parsea el contenido de users.json", async () => {
    const users: UserRecord[] = [
      { username: "sam", passwordHash: "hash1", role: "editor" },
    ];
    mockedGetFileContent.mockResolvedValue({
      content: JSON.stringify(users),
      sha: "abc",
    });
    await expect(getUsersFromRepo()).resolves.toEqual(users);
  });

  it("retorna [] si el contenido no es JSON válido", async () => {
    mockedGetFileContent.mockResolvedValue({
      content: "esto no es json",
      sha: "abc",
    });
    await expect(getUsersFromRepo()).resolves.toEqual([]);
  });
});

describe("toSafeUser", () => {
  it("quita passwordHash y aplica role por defecto 'admin'", () => {
    const safe = toSafeUser({
      username: "miller",
      passwordHash: "secreto",
      createdBy: "bootstrap-script",
    });
    expect(safe).toEqual({
      username: "miller",
      role: "admin",
      createdBy: "bootstrap-script",
      createdAt: undefined,
    });
  });
});

describe("createUserInRepo", () => {
  beforeEach(() => {
    mockedGetFileContent.mockReset();
    mockedIsRepoPrivate.mockReset();
    mockedUpsertFile.mockReset();
  });

  it("rechaza crear el usuario si el repo no es privado", async () => {
    mockedIsRepoPrivate.mockResolvedValue(false);

    await expect(
      createUserInRepo({
        username: "sam",
        passwordHash: "hash",
        role: "editor",
        createdBy: "miller",
      })
    ).rejects.toThrow(/público/i);

    expect(mockedUpsertFile).not.toHaveBeenCalled();
  });

  it("rechaza un username duplicado (case-insensitive)", async () => {
    mockedIsRepoPrivate.mockResolvedValue(true);
    mockedGetFileContent.mockResolvedValue({
      content: JSON.stringify([
        { username: "Sam", passwordHash: "x", role: "editor" },
      ]),
      sha: "abc",
    });

    await expect(
      createUserInRepo({
        username: "sam",
        passwordHash: "hash",
        role: "editor",
        createdBy: "miller",
      })
    ).rejects.toThrow(/ya existe/i);

    expect(mockedUpsertFile).not.toHaveBeenCalled();
  });

  it("agrega el usuario nuevo y escribe users.json vía upsertFile", async () => {
    mockedIsRepoPrivate.mockResolvedValue(true);
    mockedGetFileContent.mockResolvedValue(null); // users.json vacío

    await createUserInRepo({
      username: "sam",
      passwordHash: "hash123",
      role: "editor",
      createdBy: "miller",
    });

    expect(mockedUpsertFile).toHaveBeenCalledTimes(1);
    const [path, content, message] = mockedUpsertFile.mock.calls[0];
    expect(path).toBe("users.json");
    expect(message).toContain("sam");

    const written = JSON.parse(content);
    expect(written).toHaveLength(1);
    expect(written[0]).toMatchObject({
      username: "sam",
      passwordHash: "hash123",
      role: "editor",
      createdBy: "miller",
    });
    expect(written[0].createdAt).toBeTypeOf("string");
  });
});
