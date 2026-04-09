# Erasmus Claude Hackathon

> **TL;DR** — Start every response with a TL;DR: a few words capturing the core answer or action.

## Project
Hackathon project — AI-powered application built with the Claude API.

## Stack
- **Frontend**: Next.js 15 (App Router), TypeScript (strict)
- **Auth/DB**: Supabase (Auth + Postgres + Realtime)
- **AI**: Claude API — default to `claude-sonnet-4-6`
- **Deploy**: Vercel
- **Package manager**: npm

## Key Commands
- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — lint with Biome/ESLint
- `npm test` — run vitest

## Architecture Rules
- All Claude API calls happen in `/app/api/` route handlers — never from the client
- Supabase RLS must be enabled on every table that holds user data
- Use App Router conventions throughout — no Pages Router patterns
- Stream AI responses via Vercel AI SDK (`useChat` / `useCompletion`)

## Coding Style
- No `any` in TypeScript
- Tailwind for styling — no inline `style=` props
- Server Components by default; mark `"use client"` only when needed
- Environment variables: `NEXT_PUBLIC_` prefix only for values safe to expose to the browser
- Comments explain "why," not "what"
- Keep code minimal and clean — no speculative abstractions

## Communication
- Be concise — no filler, no preambles
- If a request is ambiguous, ask targeted questions before taking any action
- Surface errors early, fail fast
