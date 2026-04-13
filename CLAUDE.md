# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # Install deps, generate Prisma client, run migrations (first-time setup)
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest unit/component tests
npm run db:reset     # Reset SQLite DB and re-run migrations
```

**Environment**: `ANTHROPIC_API_KEY` in `.env` is optional — omitting it activates a mock provider that returns hardcoded demo components.

## Architecture Overview

UIGen is a Next.js 15 app (App Router) that streams Claude AI responses to generate React components with live preview.

### Data Flow

1. User sends chat message → `useChat` hook (from Vercel AI SDK) → `/api/chat` POST
2. `/api/chat` injects system prompt + virtual FS files, streams back text + tool calls
3. Client intercepts tool calls via `onToolCall` callback — applies to in-memory `VirtualFileSystem`
4. `refreshTrigger` fires → `PreviewFrame` re-renders → Babel transforms JSX in-browser → injected into sandboxed iframe via `srcdoc`
5. On finish, serialized FS + messages saved to Prisma (authenticated users only)

### Virtual File System (`src/lib/file-system.ts`)

No files touch disk. Everything is a `Map<string, FileNode>` in memory. Serialized to JSON and stored in the Prisma `Project.data` column. Reconstructed fresh on project load via `deserializeFromNodes()`.

### AI Tools (`src/lib/tools/`)

Claude is given two tools:
- `str_replace_editor` — view/create/replace/insert in the virtual FS
- `file_manager` — rename/delete operations

Tools are **not auto-executed** by the AI SDK; the client's `onToolCall` callback dispatches each operation manually to the `FileSystemContext`.

### Live Preview (`src/lib/transform/jsx-transformer.ts`)

Babel standalone runs **in the browser** (not server-side). It:
- Transforms JSX + TypeScript per-file
- Creates blob URLs for each file as an ES module import map
- Strips CSS imports (unsupported in iframe)
- Creates placeholder modules for missing imports to avoid crashes

Entry point detection order: `/App.jsx` → `/App.tsx` → first `.jsx/.tsx` file.

### Provider Pattern (`src/lib/provider.ts`)

`getLanguageModel()` returns real `@ai-sdk/anthropic` model when `ANTHROPIC_API_KEY` is set, otherwise returns `MockLanguageModel`. Mock limits to 4 steps; real API allows 40. System prompt uses Anthropic `cacheControl: { type: "ephemeral" }` for prompt caching across turns.

### Authentication (`src/lib/auth.ts`, `src/actions/`)

JWT sessions (7-day expiry) in httpOnly cookies. All auth logic is server-only (guarded by the `server-only` package). Server Actions handle sign-up/sign-in. Anonymous users can use the app without an account; their work is tracked in localStorage via `anon-work-tracker.ts`.

### Routing

- `/` — Home page; authenticated users are redirected to their first project (or a new one is created)
- `/[projectId]` — Project page; requires auth, redirects unauthenticated users to `/`

### Key Contexts

- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — owns virtual FS state, exposes file CRUD, listens for AI tool calls
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — wraps Vercel `useChat`, passes FS state to API

### Path Alias

`@/*` maps to `./src/*` throughout the codebase.

### Database Schema

The database schema is defined in `prisma/schema.prisma`. Reference it whenever you need to understand the structure of data stored in the database.
