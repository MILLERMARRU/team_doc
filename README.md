<div align="center">

# DocHubs

**Documentación técnica que se publica al instante — sin build, sin deploy.**

Escribes en `/admin`, el contenido se guarda como commit en tu propio repo de GitHub,
y aparece en el sitio al momento. GitHub es el storage; no hay base de datos que mantener.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MILLERMARRU/team_doc&env=GITHUB_TOKEN,GITHUB_OWNER,GITHUB_REPO,GITHUB_BRANCH,AUTH_SECRET&envDescription=Variables%20requeridas%20para%20conectar%20DocHubs%20a%20tu%20repo%20de%20docs%20en%20GitHub%2C%20ver%20la%20secci%C3%B3n%20README&envLink=https://github.com/MILLERMARRU/team_doc%231-variables-de-entorno&project-name=dochubs&repository-name=dochubs)

</div>

<!--
  TODO: agregar aquí un GIF o screenshot real mostrando el flujo
  admin -> guardar -> doc publicado en /docs. Sin este demo visual
  es mucho más difícil que alguien entienda el producto en 10 segundos.
-->

## ¿Por qué DocHubs?

La mayoría de generadores de docs (Docusaurus, Nextra, VitePress...) necesitan un
build y un deploy cada vez que alguien edita una página. DocHubs invierte eso:

- **Editas en el navegador** desde `/admin`, con preview en vivo.
- **Se guarda como commit real** en un repo de GitHub — tienes historial, diffs y
  control de versiones gratis, sin construir nada para lograrlo.
- **Se publica al instante** (ISR de 120s), sin pipeline de CI/CD de por medio.
- **No hay base de datos que administrar.** El repo de GitHub *es* la base de datos.

Ideal para equipos pequeños que quieren un doc-hub propio, versionado, sin pagar
por un SaaS ni mantener infraestructura.

## Features

- 📝 Editor Markdown con preview en vivo y subida de imágenes al repo
- 🔍 Búsqueda ⌘K con `cmdk`
- 🌓 Tema oscuro/claro
- 📚 Sidebar, tabla de contenidos y navegación prev/next automáticos
- 🔐 Auth propia con JWT + bcrypt (sin proveedor externo)
- 🤖 Servidor MCP incluido (`mcp/`) para que agentes de IA (Claude, Cursor, etc.)
  lean y escriban docs directamente

## Stack

- **Next.js 16 (App Router) + TypeScript**
- **TailwindCSS v4 + @tailwindcss/typography**
- **next-themes** (dark/light mode)
- **react-markdown + remark-gfm + rehype-slug/autolink/sanitize**
- **cmdk** (búsqueda ⌘K)
- **@octokit/rest** (GitHub API)
- **jose + bcryptjs** (auth JWT + hash contraseñas)

## Configuración inicial

### 1. Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

```env
GITHUB_TOKEN=ghp_xxxx           # Fine-grained PAT con Contents: read+write
GITHUB_OWNER=tu-usuario
GITHUB_REPO=mi-docs             # Repo donde se guardarán los .md
GITHUB_BRANCH=main
AUTH_SECRET=secreto-muy-largo-de-32-chars
```

### 2. Repositorio de docs en GitHub

Crea el repo `mi-docs` (o el nombre que pusiste en `GITHUB_REPO`). Puede ser público o privado.

El token de GitHub necesita estos permisos mínimos (Fine-grained PAT):
- **Contents: Read and write**
- **Metadata: Read**

**Opcional:** para no arrancar con el sitio vacío, siembra contenido de
ejemplo en tu repo con:

```bash
npm run seed-demo
```

Crea una sección "Bienvenida" con un doc de primeros pasos. Es idempotente
(correrlo dos veces no duplica nada) y respeta las variables de `.env.local`.

### 3. Crear tu usuario admin

Desde PR #7, los usuarios "de verdad" viven en `users.json` **dentro del
repo de docs configurado** (mismo patrón que `index.json`), no en un archivo
local — así funcionan también en producción (Vercel), donde el filesystem
es de solo lectura en runtime.

**El repo de docs debe ser privado** si vas a crear usuarios: el proyecto se
niega a escribir hashes de contraseña en un repo público.

Crea el primer admin con el script de bootstrap (rompe el círculo de
"necesitas ser admin para crear un admin"):

```bash
npm run create-first-admin -- tu-usuario "tu-contraseña-segura"
```

Con esa cuenta ya puedes entrar a `/admin` → pestaña **Usuarios** para
crear el resto del equipo (con rol `admin` o `editor`) desde la UI.

**Fallback de desarrollo local (opcional):** `data/users.json` sigue
funcionando como antes para pruebas locales rápidas sin tocar el repo real.
No se commitea (ver `data/users.example.json`) y sus usuarios se tratan
como rol `admin` implícito:

```bash
cp data/users.example.json data/users.json
npm run hash-password "mi-contraseña"
# Copia el hash generado y pégalo como "passwordHash" en data/users.json
```

### 4. Ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/docs` | Índice de documentación |
| `/docs/[slug]` | Documento individual |
| `/admin` | Panel de administración (protegido) |
| `/admin/login` | Login |
| `/api/docs/upsert` | POST – Guarda doc en GitHub |
| `/api/docs/nav` | GET – Devuelve el index.json |
| `/api/auth/login` | POST – Login |
| `/api/auth/logout` | POST – Logout |
| `/api/admin/users` | GET/POST – Lista/crea usuarios (requiere role `admin`) |

## Estructura del proyecto

```
app/
  page.tsx                      # Landing
  docs/
    layout.tsx                  # Layout 3 columnas
    [[...slug]]/
      page.tsx                  # Render markdown
      not-found.tsx
  admin/
    page.tsx                    # Editor (protegido)
    login/page.tsx              # Login
    _components/
      AdminEditor.tsx
      LoginForm.tsx
      UsersPanel.tsx
  api/
    docs/upsert/route.ts
    docs/nav/route.ts
    auth/login/route.ts
    auth/logout/route.ts
    admin/users/route.ts
components/
  Navbar.tsx
  Providers.tsx
  docs/
    Sidebar.tsx
    Toc.tsx
    Markdown.tsx
    SearchCmdk.tsx
    MobileSidebar.tsx
  ui/
    ThemeToggle.tsx
lib/
  github.ts                     # Cliente GitHub API
  docs.ts                       # Utilidades docs
  auth.ts                       # JWT / bcrypt / merge de usuarios
  users.ts                      # Usuarios persistidos en users.json del repo
  utils.ts                      # cn()
data/
  users.example.json            # Template de usuarios admin (fallback local)
  users.json                    # Fallback local, solo dev (no se sube, ver .gitignore)
types/
  index.ts                      # Tipos globales
scripts/
  hash-password.mjs             # Genera hashes bcrypt
  create-first-admin.mjs        # Bootstrap del primer usuario en el repo
  seed-demo-docs.mjs            # Contenido de ejemplo
mcp/
  server.ts                     # Servidor MCP para agentes de IA
```

## Seguridad

- El `GITHUB_TOKEN` y `AUTH_SECRET` **nunca** llegan al cliente (solo server-side).
- El panel `/admin` redirige a `/admin/login` sin sesión válida.
- El Markdown se sanitiza con `rehype-sanitize` (previene XSS).
- Tamaño máximo de upload: **2 MB**.
- Sesión JWT con expiración de **8 horas**, incluye el `role` del usuario.
- `data/users.json` (fallback local) nunca se commitea (ver `data/users.example.json`).
- Los usuarios "de verdad" viven en `users.json` del repo de docs. El proyecto
  **se niega a crear usuarios si ese repo no es privado** (`isRepoPrivate()`),
  para no exponer hashes de contraseña.
- Roles: `admin` (gestiona usuarios) y `editor` (solo lee/escribe docs).

## Deployment (Vercel)

1. Conecta el repo a Vercel.
2. En "Environment Variables" añade las mismas vars del `.env.example`.
3. Deploy. No necesitas hacer nada más — el contenido se gestiona desde el panel admin.

## Contribuir

¿Quieres agregar una feature o reportar un bug? Lee [CONTRIBUTING.md](./CONTRIBUTING.md).
Este proyecto sigue el [Código de Conducta](./CODE_OF_CONDUCT.md).

## Licencia

[MIT](./LICENSE) © Miller Zamora & Sam Vasquez
