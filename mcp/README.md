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

| Variable | Description | Required |
|---|---|---|
| `GITHUB_TOKEN` | GitHub PAT with `repo` scope — ask the author | Yes |
| `GITHUB_OWNER` | `MILLERMARRU` | Yes |
| `GITHUB_REPO` | `mi_docs` | Yes |
| `GITHUB_BRANCH` | `main` | No (default: `main`) |
| `SITE_URL` | `https://dochubs.vercel.app` | No |
| `REVALIDATE_SECRET` | Secret token for on-demand revalidation — ask the author | No |

> `GITHUB_TOKEN` and `REVALIDATE_SECRET` are private — contact the author to get them.

### On-demand revalidation

If `SITE_URL` and `REVALIDATE_SECRET` are set, the MCP calls `/api/revalidate` after every write operation — docs appear on the site **instantly** without waiting for the ISR cache (120s) to expire.

---

## Windows note

On **Windows**, `npx` requires a `cmd /c` wrapper. Use `"command": "cmd"` with `"/c"` as the first arg, as shown below.

On **macOS / Linux**, use `"command": "npx"` directly.

---

## Claude Code

### Windows — `.mcp.json` or `~/.claude/settings.json`

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

### macOS / Linux — `.mcp.json` or `~/.claude/settings.json`

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

---

## Cursor

### Windows — `.cursor/mcp.json`

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

### macOS / Linux — `~/.cursor/mcp.json`

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

---

## Gemini CLI

### Windows — `~/.gemini/settings.json`

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

### macOS / Linux — `~/.gemini/settings.json`

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

---

## Windsurf

### Windows — `~/.windsurf/mcp_config.json`

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

### macOS / Linux — `~/.windsurf/mcp_config.json`

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

---

## Cline / Roo Code (VS Code)

### Windows

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

### macOS / Linux

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

---

## License

MIT © Millermarru
