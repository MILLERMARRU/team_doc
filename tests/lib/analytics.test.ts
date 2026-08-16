import { beforeEach, describe, expect, it, vi } from "vitest";

const { hincrby, hgetall } = vi.hoisted(() => ({
  hincrby: vi.fn(),
  hgetall: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn(() => ({ hincrby, hgetall })),
  },
}));

import { getViewCounts, trackView } from "@/lib/analytics";

describe("trackView", () => {
  beforeEach(() => {
    hincrby.mockReset();
  });

  it("incrementa el hash docs:views para el slug dado", async () => {
    hincrby.mockResolvedValueOnce(1);

    await trackView("guides/intro");

    expect(hincrby).toHaveBeenCalledWith("docs:views", "guides/intro", 1);
  });
});

describe("getViewCounts", () => {
  beforeEach(() => {
    hgetall.mockReset();
  });

  it("retorna {} si todavía no hay vistas registradas", async () => {
    hgetall.mockResolvedValueOnce(null);
    await expect(getViewCounts()).resolves.toEqual({});
  });

  it("retorna el mapa slug -> conteo numérico", async () => {
    hgetall.mockResolvedValueOnce({ "guides/intro": 5, "guides/advanced": 2 });

    await expect(getViewCounts()).resolves.toEqual({
      "guides/intro": 5,
      "guides/advanced": 2,
    });
  });

  it("convierte valores string a número (compatibilidad de clientes)", async () => {
    hgetall.mockResolvedValueOnce({ "guides/intro": "7" });

    await expect(getViewCounts()).resolves.toEqual({ "guides/intro": 7 });
  });
});
