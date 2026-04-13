# Personal Wikipedia Companion

> Talk to your learning, and your personal wiki builds itself.

Built for the **[Erasmus Claude Hackathon](https://erasmusai.nl/)** — a competition challenging teams to build meaningful AI applications using the Claude API.

Link to deployed version: **[Personal_Wiki_](https://erasmus-claude-hackathon.vercel.app/)**

The core problem we tackled: people learn constantly — across chats, papers, random notes, and half-formed thoughts — but that knowledge stays fragmented and siloed. Existing tools help you *store* notes. They don't actively structure, connect, or reason over what you know.

Personal Wikipedia Companion is our answer to that. It's an AI companion that listens to what you learn, structures it into wiki pages, links related ideas, and answers questions grounded in your own knowledge — not generic web knowledge. The more you use it, the smarter it gets about *your* understanding specifically.

## What it does

You talk, paste notes, or upload files. The system creates wiki pages, links related concepts, and answers questions grounded in your own knowledge — automatically.

**Core loop:**
1. Tell it what you learned (or upload a paper/notes)
2. A structured wiki page is created or updated
3. Related concepts get linked automatically
4. Ask questions — answers cite your own wiki pages

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| AI | Claude API via Vercel AI SDK (`claude-haiku-4-5` for chat, `claude-sonnet-4-6` for wiki actions) |
| Auth & DB | Supabase (Auth + Postgres + Realtime) |
| Deploy | Vercel |

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project
- An Anthropic API key

### Setup

```bash
npm install
```

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
```

Run the Supabase migrations in `supabase/` to create the schema (tables: `profiles`, `wiki_pages`, `page_links`, `sources`).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build
npm run lint     # Biome check
npm test         # Vitest
```

## Architecture

All Claude API calls happen in `/app/api/` — never from the client. The three-panel UI (chat / wiki / context) communicates via Supabase Realtime: the API route writes to Postgres, and the client receives updates through a Realtime subscription.

```
User input → /app/api/chat → Claude (structured JSON output)
                           → Supabase write
                           → Realtime event → UI update
```

Row Level Security is enabled on every user-owned table. JWTs are forwarded from the client to API routes — the service role key is never used for user data.

## File ingestion

Supported: PDF (text layer), `.txt`, `.md` — up to 10 MB.

## License

MIT
