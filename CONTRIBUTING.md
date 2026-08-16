# Contribuir a DocHubs

Gracias por tu interés en mejorar DocHubs. Esta guía cubre lo mínimo para
proponer un cambio.

## Requisitos

- Node.js 20+
- Un fork o acceso de escritura al repositorio
- Para probar el flujo completo (login, guardar docs): un repo de GitHub
  propio y un token con permisos `Contents: Read and write` (ver `README.md`)

## Configuración local

```bash
git clone https://github.com/MILLERMARRU/team_doc.git
cd team_doc
npm install
cp .env.example .env.local   # completa las variables
npm run dev
```

## Flujo de trabajo

1. Crea una rama descriptiva a partir de `main`: `feat/...`, `fix/...`,
   `docs/...`, `chore/...`.
2. Haz commits atómicos: un cambio lógico por commit, con mensajes en formato
   [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
3. Antes de abrir el PR, corre:
   ```bash
   npm run lint
   npm run build
   ```
4. Abre el Pull Request contra `main` describiendo el problema que resuelve y
   cómo lo probaste.

## Convenciones del proyecto

- Comentarios de código en **español**, siguiendo el estilo existente
  (`// ══ Título ───────`).
- Alias de imports: usa `@/` en vez de rutas relativas largas.
- Slugs de documentación: solo `[a-z0-9-/]`, sin mayúsculas, tildes ni
  espacios.
- Server Components por defecto; agrega `"use client"` solo cuando el
  componente lo necesite.
- No subas nunca `.env.local`, tokens ni credenciales en un commit o PR.

Para más contexto de arquitectura, revisa `CLAUDE.md` en la raíz del repo.

## Reportar bugs o proponer features

Abre un Issue describiendo:
- Qué esperabas que pasara vs. qué pasó
- Pasos para reproducir (si es un bug)
- Contexto relevante (versión de Node, navegador, etc.)

## Código de conducta

Este proyecto sigue el [Código de Conducta](./CODE_OF_CONDUCT.md). Al
participar, aceptas cumplirlo.
