import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import type { UserRecord } from "@/types";

const localUsers: UserRecord[] = [
  { username: "miller", passwordHash: bcrypt.hashSync("correcta123", 4) },
];

vi.mock("fs", () => ({
  readFileSync: vi.fn(() => JSON.stringify(localUsers)),
}));

// getSession() usa next/headers, que solo funciona dentro del runtime de
// Next.js. Se mockea para poder importar lib/auth.ts en un test unitario
// aislado; no se testea getSession() directamente en este archivo.
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/users", () => ({
  getUsersFromRepo: vi.fn(),
  toSafeUser: (u: UserRecord) => ({
    username: u.username,
    role: u.role ?? "admin",
    createdBy: u.createdBy,
    createdAt: u.createdAt,
  }),
}));

process.env.AUTH_SECRET = "secreto-de-test-con-al-menos-32-caracteres";

const { getUsersFromRepo } = await import("@/lib/users");
const { verifyCredentials, createSession, getAllUsersSafe } = await import(
  "@/lib/auth"
);

const mockedGetUsersFromRepo = vi.mocked(getUsersFromRepo);

describe("verifyCredentials", () => {
  beforeEach(() => {
    mockedGetUsersFromRepo.mockReset();
    mockedGetUsersFromRepo.mockResolvedValue([]);
  });

  it("acepta un usuario local (legado, sin role) con role 'admin' implícito", async () => {
    await expect(verifyCredentials("miller", "correcta123")).resolves.toEqual(
      { ok: true, role: "admin" }
    );
  });

  it("rechaza una contraseña incorrecta", async () => {
    await expect(
      verifyCredentials("miller", "incorrecta")
    ).resolves.toEqual({ ok: false, role: null });
  });

  it("es case-insensitive con el username", async () => {
    await expect(verifyCredentials("MILLER", "correcta123")).resolves.toEqual(
      { ok: true, role: "admin" }
    );
  });

  it("rechaza un usuario que no existe", async () => {
    await expect(
      verifyCredentials("no-existe", "cualquier-cosa")
    ).resolves.toEqual({ ok: false, role: null });
  });

  it("respeta el role explícito de un usuario del repo", async () => {
    mockedGetUsersFromRepo.mockResolvedValue([
      {
        username: "sam",
        passwordHash: bcrypt.hashSync("otraClave123", 4),
        role: "editor",
      },
    ]);

    await expect(verifyCredentials("sam", "otraClave123")).resolves.toEqual({
      ok: true,
      role: "editor",
    });
  });

  it("prioriza al usuario del repo si colisiona el username con uno local", async () => {
    mockedGetUsersFromRepo.mockResolvedValue([
      {
        username: "miller",
        passwordHash: bcrypt.hashSync("claveDelRepo123", 4),
        role: "editor",
      },
    ]);

    // La clave local ya no funciona: gana la del repo
    await expect(
      verifyCredentials("miller", "correcta123")
    ).resolves.toEqual({ ok: false, role: null });

    await expect(
      verifyCredentials("miller", "claveDelRepo123")
    ).resolves.toEqual({ ok: true, role: "editor" });
  });
});

describe("createSession", () => {
  it("genera un JWT firmado con AUTH_SECRET que contiene username y role", async () => {
    const token = await createSession("miller", "admin");
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    expect(payload.username).toBe("miller");
    expect(payload.role).toBe("admin");
  });
});

describe("getAllUsersSafe", () => {
  it("no expone passwordHash y refleja el merge local + repo", async () => {
    mockedGetUsersFromRepo.mockResolvedValue([
      {
        username: "sam",
        passwordHash: "irrelevante",
        role: "editor",
        createdBy: "miller",
      },
    ]);

    const users = await getAllUsersSafe();
    expect(users).toEqual(
      expect.arrayContaining([
        { username: "miller", role: "admin" },
        {
          username: "sam",
          role: "editor",
          createdBy: "miller",
          createdAt: undefined,
        },
      ])
    );
    expect(JSON.stringify(users)).not.toContain("passwordHash");
  });
});
