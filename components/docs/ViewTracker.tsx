"use client";
// ============================================================
//  components/docs/ViewTracker.tsx
//  Dispara un POST de "vista" al montar. No renderiza nada.
//  Client-side a propósito: la página de doc tiene ISR, así que
//  contar en el server contaría solo los renders reales, no las
//  visitas servidas desde caché.
// ============================================================

import { useEffect } from "react";

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch("/api/docs/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {
      // Best-effort: si falla, no interrumpe la lectura del doc.
    });
  }, [slug]);

  return null;
}
