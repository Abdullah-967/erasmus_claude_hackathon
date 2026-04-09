# Knowledge Graph View — Design Spec

**Date:** 2026-04-09
**Status:** Approved

## Overview

Add a `/graph` route that renders the user's wiki as an interactive knowledge graph using React Flow. Nodes are wiki pages; edges are `page_links`. The view is focus-mode by default: start from one page, see its direct connections, expand hop-by-hop. A slide-in side panel shows page detail when a node is selected.

---

## Architecture

### New files

| File | Purpose |
|------|---------|
| `app/graph/page.tsx` | Route entry — Server Component, auth guard, renders `KnowledgeGraph` |
| `components/KnowledgeGraph.tsx` | Main Client Component — owns all graph state, derives React Flow nodes/edges |
| `components/GraphPagePanel.tsx` | Slide-in side panel — node detail, expand action, open-full-page action |

### Modified files

| File | Change |
|------|--------|
| `components/AppShell.tsx` | Add graph icon to header; read `?page=<id>` URL param on mount to restore active page |
| `components/WikiPageView.tsx` | Add "View in graph →" link in page header linking to `/graph?focus=<pageId>` |

### Dependencies

```
@xyflow/react      — React Flow v12 (graph rendering, pan, zoom, drag)
```

No new API routes. The graph page queries Supabase directly from the client, identical to the pattern used in `AppShell`. Layout uses custom radial math — no external layout library needed.

---

## Data & Focus Logic

### Data fetch (on mount)

Two queries against the authenticated user's data:

```sql
SELECT id, title, summary, key_points, updated_at
FROM wiki_pages
WHERE user_id = $uid

SELECT source_page_id, target_page_id, relationship_type, relationship_reason
FROM page_links
WHERE user_id = $uid
```

All data loaded into memory once. No pagination needed for V1 wiki scale.

### Focus state

| State | Type | Description |
|-------|------|-------------|
| `focusPageId` | `string` | Seeded from `?focus=<id>` URL param; falls back to most recently updated page (`updated_at DESC LIMIT 1`) |
| `visibleIds` | `Set<string>` | Pages currently rendered in the graph; starts as `{ focusPageId }` + its direct neighbors |

### Visible node computation

```
Initial: visibleIds = { focusPageId } ∪ { all pages with a link to/from focusPageId }

On "Expand" for node N:
  visibleIds = visibleIds ∪ { all pages with a link to/from N }
```

Visible edges = edges where **both** `source_page_id` and `target_page_id` are in `visibleIds`.

### Layout

Custom radial positioning, recomputed when `visibleIds` changes:

- **Focal node:** canvas center (e.g. x: 500, y: 350)
- **1-hop neighbors:** evenly distributed on a circle, radius 220px
- **2-hop+ nodes:** evenly distributed on a larger ring, radius 420px

Users can drag nodes freely after layout (React Flow default). Layout does not re-run on drag.

---

## Components

### `KnowledgeGraph.tsx`

Client Component. Owns:

- `allPages: WikiPage[]` — raw Supabase data
- `allLinks: PageLink[]` — raw Supabase data
- `focusPageId: string`
- `visibleIds: Set<string>`
- `selectedNodeId: string | null` — drives side panel

Derives React Flow `nodes` and `edges` on each render from the above state. No memoization needed at V1 scale.

**Node appearance:**
- Default node: 160×50px rounded rectangle, dark background, white title text
- Focal node: 180×60px, brighter border color to distinguish it

**Edge appearance:**
- Uniform gray with directional arrow marker
- `title` attribute set to `"${relationship_type} — ${relationship_reason}"` for native browser hover tooltip
- No color coding by relationship type

**Empty state:** If the user has no pages, render a centered message: "Your wiki is empty — start adding knowledge to see it here."

### `GraphPagePanel.tsx`

Fixed right panel, 300px wide, slides in when `selectedNodeId` is set.

Dismissed by:
- Clicking the graph background (React Flow `onPaneClick`)
- Clicking the ✕ button in the panel

**Content:**
1. Page title (h2)
2. Summary (paragraph)
3. Key points (bulleted list)

**Actions:**
- **"Expand connections"** — adds the selected node's direct neighbors to `visibleIds`. Disabled (greyed out) when all neighbors are already visible.
- **"Open full page →"** — navigates to `/?page=<pageId>`. AppShell reads this param on mount and sets the active page.

### `AppShell.tsx` changes

AppShell currently renders a pure 3-column grid with no header row. Adding the graph icon requires a structural change:

1. Change grid to `grid-rows-[40px_1fr]` + `grid-cols-[320px_1fr_280px]`
2. Add a header bar spanning all 3 columns (row 1) — minimal height, contains: app title (left), graph icon button (right)
3. All three panels move to row 2
4. Graph icon button: `router.push('/graph')`
5. On mount: if `?page=<id>` URL param is present, after `allPages` is loaded, find the page by id and call `setActivePage`.

### `WikiPageView.tsx` changes

Add a small "View in graph →" link in the page header. Only rendered when `activePage` is non-null. Routes to `/graph?focus=<activePage.id>`.

---

## Navigation & Entry Points

### Entry point 1 — Header icon

- Graph icon in AppShell header bar
- `router.push('/graph')` — no focus param; graph defaults to most recently updated page

### Entry point 2 — Wiki page link

- "View in graph →" in WikiPageView header
- Routes to `/graph?focus=<page.id>`
- Graph opens focused on that specific page

### Return navigation

- `/graph` page has its own minimal header bar (not the 3-panel shell)
- "← Back to wiki" button → `router.push('/')`
- AppShell re-initializes to most recently updated page on return (existing behavior)

### `/graph` page header bar

| Position | Content |
|----------|---------|
| Left | "← Back to wiki" button |
| Center | "Knowledge Graph" title |
| Right | Subtle stat: `{n} pages · {m} connections` — counts visible nodes/edges |

---

## Error & Edge Cases

| Case | Behavior |
|------|----------|
| `?focus=<id>` param points to a non-existent page | Fall back to most recently updated page; no error shown |
| User has pages but no links | Show all pages as isolated nodes; "Expand connections" disabled on all |
| User has zero pages | Empty state message, no React Flow canvas rendered |
| Supabase fetch fails | Show inline error: "Couldn't load your knowledge graph — try refreshing." |
| Single page, no connections | Focal node centered, side panel opens immediately, "Expand" disabled |

---

## Out of Scope

The following are explicitly not part of this feature:

- Creating or editing links from the graph view
- Filtering by relationship type
- Graph export or sharing
- Semantic search within the graph
- Performance optimization for >500 nodes (deferred)
- Animated edge drawing or particle effects
