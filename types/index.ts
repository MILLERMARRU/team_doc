// ============================================================
//  Tipos globales compartidos en todo el proyecto
// ============================================================

/** Un ítem de documentación dentro de una sección */
export interface DocItem {
  title: string;
  /** URL slug: devops/docker/build  →  /docs/devops/docker/build */
  slug: string;
  /** Ruta del .md dentro del repo GitHub: docs/devops/docker/build.md */
  path: string;
  order: number;
  tags?: string[];
  /** Descripción corta opcional (para la búsqueda) */
  description?: string;
  /** Usuario admin que creó el documento */
  createdBy?: string;
}

/** Una sección del sidebar (agrupa DocItems) */
export interface DocSection {
  title: string;
  order: number;
  items: DocItem[];
}

/** Estructura completa del index.json en GitHub */
export interface DocsIndex {
  sections: DocSection[];
}

/** Body del endpoint POST /api/docs/upsert */
export interface UpsertDocBody {
  title: string;
  section: string;
  slug: string;
  content: string;
  order?: number;
  tags?: string[];
  description?: string;
}

/** Payload del JWT de sesión admin */
export interface SessionPayload {
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/** Rol de un usuario admin: "admin" gestiona usuarios, "editor" solo docs */
export type UserRole = "admin" | "editor";

/**
 * Usuario persistido (en data/users.json local o en users.json del repo
 * de GitHub). `role` es opcional para no romper el esquema legado de
 * data/users.json anterior a PR #7 — ausente se interpreta como "admin".
 */
export interface UserRecord {
  username: string;
  passwordHash: string;
  role?: UserRole;
  createdBy?: string;
  createdAt?: string;
}

/** Versión de UserRecord sin passwordHash, segura para exponer en la UI */
export interface SafeUser {
  username: string;
  role: UserRole;
  createdBy?: string;
  createdAt?: string;
}
