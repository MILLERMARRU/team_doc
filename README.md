# DocHubs — Documentación autogestionable sin redeploy

> Sitio de documentación técnica donde el usuario sube/pega Markdown desde un panel `/admin` y el contenido aparece **al instante** en el sitio, usando **GitHub** como storage. Sin builds, sin deploys.

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

### 3. Crear tu usuario admin

`data/users.json` **no se sube al repo** (contiene hashes de contraseñas).
Créalo localmente a partir del template:

```bash
cp data/users.example.json data/users.json
npm run hash-password "mi-contraseña"
# Copia el hash generado y pégalo como "passwordHash" en data/users.json
```

En producción (Vercel u otro host), sube este archivo por fuera del repo
(por ejemplo como parte del deploy) o adapta `lib/auth.ts` para leer las
credenciales desde variables de entorno.

### 4. Ejecutar

```bash
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
  api/
    docs/upsert/route.ts
    docs/nav/route.ts
    auth/login/route.ts
    auth/logout/route.ts
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
  auth.ts                       # JWT / bcrypt
  utils.ts                      # cn()
data/
  users.json                    # Usuarios admin (solo local)
types/
  index.ts                      # Tipos globales
scripts/
  hash-password.mjs             # Genera hashes bcrypt
```

## Seguridad

- El `GITHUB_TOKEN` y `AUTH_SECRET` **nunca** llegan al cliente (solo server-side).
- El panel `/admin` redirige a `/admin/login` sin sesión válida.
- El Markdown se sanitiza con `rehype-sanitize` (previene XSS).
- Tamaño máximo de upload: **2 MB**.
- Sesión JWT con expiración de **8 horas**.

## Deployment (Vercel)

1. Conecta el repo a Vercel.
2. En "Environment Variables" añade las mismas vars del `.env.example`.
3. Deploy. No necesitas hacer nada más — el contenido se gestiona desde el panel admin.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
