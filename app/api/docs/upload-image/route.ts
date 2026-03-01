// ============================================================
//  app/api/docs/upload-image/route.ts
//  Endpoint protegido para subir imágenes al repo de GitHub.
//  Solo admins autenticados pueden usarlo.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { upsertBinaryFile, buildRawUrl } from "@/lib/github";

// Extensiones permitidas
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg"];
// Límite de 5 MB en base64
const MAX_BASE64_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  // ── Verificar sesión ──────────────────────────────────────
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { filename, base64 } = body as { filename?: string; base64?: string };

    if (!filename || !base64) {
      return NextResponse.json(
        { error: "Se requieren 'filename' y 'base64'" },
        { status: 400 }
      );
    }

    // ── Validar extensión ─────────────────────────────────
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Extensión no permitida. Usa: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // ── Validar tamaño ────────────────────────────────────
    // El base64 puede incluir el prefijo "data:image/...;base64," — lo eliminamos
    const pureBase64 = base64.includes(",") ? base64.split(",")[1] : base64;

    if (pureBase64.length > MAX_BASE64_BYTES) {
      return NextResponse.json(
        { error: "La imagen supera el tamaño máximo de 5 MB" },
        { status: 400 }
      );
    }

    // ── Construir nombre sanitizado con timestamp ─────────
    const safeName = filename
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .replace(/-+/g, "-");

    const timestamp = Date.now();
    const nameWithoutExt = safeName.replace(`.${ext}`, "");
    const finalName = `${nameWithoutExt}-${timestamp}.${ext}`;
    const repoPath = `docs/images/${finalName}`;

    // ── Subir a GitHub ────────────────────────────────────
    await upsertBinaryFile(
      repoPath,
      pureBase64,
      `docs: subir imagen ${finalName}`
    );

    // ── Devolver URL pública ───────────────────────────────
    const url = buildRawUrl(repoPath);

    return NextResponse.json({ url, path: repoPath, filename: finalName });
  } catch (err: unknown) {
    console.error("[upload-image] Error:", err);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
