// ============================================================
//  lib/analytics.ts  –  contador de vistas por doc (Upstash Redis)
//  Provisionado vía Vercel Marketplace: KV_REST_API_URL/TOKEN
//  (Redis.fromEnv() los toma como fallback de UPSTASH_REDIS_REST_*).
// ============================================================

import { Redis } from "@upstash/redis";

const VIEWS_KEY = "docs:views";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = Redis.fromEnv();
  }
  return _redis;
}

// ── Registrar una vista de un doc ──────────────────────────────

export async function trackView(slug: string): Promise<void> {
  const redis = getRedis();
  await redis.hincrby(VIEWS_KEY, slug, 1);
}

// ── Leer el conteo de vistas de todos los docs ─────────────────

export async function getViewCounts(): Promise<Record<string, number>> {
  const redis = getRedis();
  const raw = await redis.hgetall<Record<string, number>>(VIEWS_KEY);
  if (!raw) return {};

  // hgetall puede devolver los valores como string según el cliente/versión
  const counts: Record<string, number> = {};
  for (const [slug, value] of Object.entries(raw)) {
    counts[slug] = typeof value === "number" ? value : parseInt(String(value), 10) || 0;
  }
  return counts;
}
