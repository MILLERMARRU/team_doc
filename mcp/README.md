# dochubs-mcp

MCP server for [DocHubs](https://github.com/MILLERMARRU/team_doc) — manage your documentation from any AI assistant that supports the Model Context Protocol.

## Tools available

| Tool | Description |
|---|---|
| `create_doc` | Create a new doc (auto-generates slug, section, tags) |
| `update_doc` | Update an existing doc by slug |
| `get_doc` | Read a doc's full Markdown content |
| `list_docs` | List all docs, optionally filtered by section |
| `delete_doc` | Delete a doc (respects ownership) |

## Requirements

- Node.js 18+
- A GitHub Personal Access Token with `repo` scope

## Configuration

All tools require these environment variables:

| Variable | Description | Required |
|---|---|---|
| `GITHUB_TOKEN` | GitHub PAT with `repo` scope — ask the author | Yes |
| `GITHUB_OWNER` | `MILLERMARRU` | Yes |
| `GITHUB_REPO` | `mi_docs` | Yes |
| `GITHUB_BRANCH` | `main` | No (default: `main`) |
| `SITE_URL` | `https://dochubs.vercel.app` | No |
| `REVALIDATE_SECRET` | Secret token to trigger on-demand ISR revalidation — ask the author | No |

> `GITHUB_TOKEN` and `REVALIDATE_SECRET` are private — contact the author to get them.

### On-demand revalidation

If `SITE_URL` and `REVALIDATE_SECRET` are set, the MCP will automatically call `/api/revalidate` on your site after every `create_doc`, `update_doc`, or `delete_doc` — making changes visible **instantly** without waiting for the ISR cache (default: 120s) to expire.

---

## Windows note

On **Windows**, `npx` requires a `cmd /c` wrapper. Use `"command": "cmd"` with `"/c"` as the first arg, as shown in the Windows configs below.

On **macOS / Linux**, use `"command": "npx"` directly.

---

## Claude Code

### macOS / Linux — `~/.claude/settings.json` or `.mcp.json`

```json
{
  "mcpServers": {
    "dochubs": {
      "type": "stdio",
      "command": "npx",
      "args": ["dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← pídelo al autor",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← pídelo al autor"
      }
    }
  }
}
```

### Windows — `~/.claude/settings.json` o `.mcp.json`

```json
{
  "mcpServers": {
    "dochubs": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← pídelo al autor",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← pídelo al autor"
      }
    }
  }
}
```

---

## Cursor

### macOS / Linux — `~/.cursor/mcp.json` or `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "dochubs": {
      "command": "npx",
      "args": ["dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← pídelo al autor",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← pídelo al autor"
      }
    }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "dochubs": {
      "command": "cmd",
      "args": ["/c", "npx", "dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← pídelo al autor",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← pídelo al autor"
      }
    }
  }
}
```

---

## Gemini CLI

### macOS / Linux — `~/.gemini/settings.json`

```json
{
  "mcpServers": {
    "dochubs": {
      "command": "npx",
      "args": ["dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← pídelo al autor",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← pídelo al autor"
      }
    }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "dochubs": {
      "command": "cmd",
      "args": ["/c", "npx", "dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← pídelo al autor",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← pídelo al autor"
      }
    }
  }
}
```

---

## Windsurf

### macOS / Linux — `~/.windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "dochubs": {
      "command": "npx",
      "args": ["dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← pídelo al autor",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← pídelo al autor"
      }
    }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "dochubs": {
      "command": "cmd",
      "args": ["/c", "npx", "dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← pídelo al autor",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← pídelo al autor"
      }
    }
  }
}
```

---

## Cline / Roo Code (VS Code)

### macOS / Linux

```json
{
  "mcpServers": {
    "dochubs": {
      "command": "npx",
      "args": ["dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← pídelo al autor",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← pídelo al autor"
      }
    }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "dochubs": {
      "command": "cmd",
      "args": ["/c", "npx", "dochubs-mcp"],
      "env": {
        "GITHUB_TOKEN": "← pídelo al autor",
        "GITHUB_OWNER": "MILLERMARRU",
        "GITHUB_REPO": "mi_docs",
        "GITHUB_BRANCH": "main",
        "SITE_URL": "https://dochubs.vercel.app",
        "REVALIDATE_SECRET": "← pídelo al autor"
      }
    }
  }
}
```

---

## License

MIT © Millermarru
