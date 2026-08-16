import { describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";

const mockUsers = [
  { username: "miller", passwordHash: bcrypt.hashSync("correcta123", 4) },
];

vi.mock("fs", () => ({
  readFileSync: vi.fn(() => JSON.stringify(mockUsers)),
}));

// getSession() usa next/headers, que solo funciona dentro del runtime de
// Next.js. Se mockea para poder importar lib/auth.ts en un test unitario
// aislado; no se testea getSession() directamente en este archivo.
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

process.env.AUTH_SECRET = "secreto-de-test-con-al-menos-32-caracteres";

const { verifyCredentials, createSession } = await import("@/lib/auth");

describe("verifyCredentials", () => {
  it("acepta usuario y contraseña correctos", async () => {
    await expect(verifyCredentials("miller", "correcta123")).resolves.toBe(
      true
    );
  });

  it("rechaza una contraseña incorrecta", async () => {
    await expect(verifyCredentials("miller", "incorrecta")).resolves.toBe(
      false
    );
  });

  it("es case-insensitive con el username", async () => {
    await expect(verifyCredentials("MILLER", "correcta123")).resolves.toBe(
      true
    );
  });

  it("rechaza un usuario que no existe", async () => {
    await expect(
      verifyCredentials("no-existe", "cualquier-cosa")
    ).resolves.toBe(false);
  });
});

describe("createSession", () => {
  it("genera un JWT firmado con AUTH_SECRET que contiene el username", async () => {
    const token = await createSession("miller");
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    expect(payload.username).toBe("miller");
  });
});
