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
  iat?: number;
  exp?: number;
}
