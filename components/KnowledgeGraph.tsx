"use client";

import { createClient } from "@/lib/supabase/client";
import type { PageLink, WikiPage } from "@/types/database";
import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GraphPagePanel from "./GraphPagePanel";

// ─── Layout ──────────────────────────────────────────────────────────────────

function computeLayout(
  allPages: WikiPage[],
  allLinks: PageLink[],
  focusId: string,
  visibleIds: Set<string>,
): Node[] {
  const cx = 600;
  const cy = 350;
  const r1 = 220;
  const r2 = 420;

  // Determine hop distance from focusId for each visible node
  const hop: Record<string, number> = { [focusId]: 0 };
  const queue = [focusId];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const link of allLinks) {
      const neighbor =
        link.source_page_id === cur
          ? link.target_page_id
          : link.target_page_id === cur
            ? link.source_page_id
            : null;
      if (neighbor && visibleIds.has(neighbor) && hop[neighbor] === undefined) {
        hop[neighbor] = (hop[cur] ?? 0) + 1;
        queue.push(neighbor);
      }
    }
  }

  // Group by hop distance
  const byHop: Record<number, string[]> = {};
  for (const id of visibleIds) {
    const h = hop[id] ?? 2;
    byHop[h] = byHop[h] ?? [];
    byHop[h].push(id);
  }

  const positions: Record<string, { x: number; y: number }> = {};

  for (const [hopStr, ids] of Object.entries(byHop)) {
    const h = Number(hopStr);
    if (h === 0) {
      positions[ids[0]] = { x: cx, y: cy };
    } else {
      const radius = h === 1 ? r1 : r2 + (h - 2) * 180;
      ids.forEach((id, i) => {
        const angle = (2 * Math.PI * i) / ids.length - Math.PI / 2;
        positions[id] = {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        };
      });
    }
  }

  const pageMap = new Map(allPages.map((p) => [p.id, p]));

  return [...visibleIds].map((id) => {
    const page = pageMap.get(id);
    const isFocus = id === focusId;
    const pos = positions[id] ?? { x: cx, y: cy };
    return {
      id,
      position: pos,
      data: { label: page?.title ?? id },
      style: {
        width: isFocus ? 180 : 160,
        height: isFocus ? 60 : 50,
        background: isFocus ? "#1e3a5f" : "#1f2937",
        border: `1.5px solid ${isFocus ? "#3b82f6" : "#374151"}`,
        borderRadius: "8px",
        color: "#f3f4f6",
        fontSize: "13px",
        fontWeight: isFocus ? 600 : 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 8px",
        textAlign: "center" as const,
        cursor: "pointer",
      },
    };
  });
}

function computeEdges(allLinks: PageLink[], visibleIds: Set<string>): Edge[] {
  return allLinks
    .filter(
      (l) => visibleIds.has(l.source_page_id) && visibleIds.has(l.target_page_id),
    )
    .map((l) => ({
      id: l.id,
      source: l.source_page_id,
      target: l.target_page_id,
      type: "smoothstep",
      style: { stroke: "#4b5563", strokeWidth: 1.5 },
      markerEnd: { type: "arrowclosed" as const, color: "#4b5563" },
      label: undefined,
      // Native tooltip via title
      title: `${l.relationship_type.replace(/_/g, " ")} — ${l.relationship_reason}`,
    }));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KnowledgeGraph() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusParam = searchParams.get("focus");

  const [allPages, setAllPages] = useState<WikiPage[]>([]);
  const [allLinks, setAllLinks] = useState<PageLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [focusId, setFocusId] = useState<string | null>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Keep a stable ref to avoid stale closures in callbacks
  const stateRef = useRef({ allPages, allLinks, visibleIds, focusId });
  useEffect(() => {
    stateRef.current = { allPages, allLinks, visibleIds, focusId };
  }, [allPages, allLinks, visibleIds, focusId]);

  // ── Fetch all data on mount ────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [pagesRes, linksRes] = await Promise.all([
        supabase
          .from("wiki_pages")
          .select("id, title, summary, key_points, aliases, body, examples, user_id, created_at, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("page_links")
          .select("id, user_id, source_page_id, target_page_id, relationship_type, relationship_reason, created_at")
          .eq("user_id", user.id),
      ]);

      if (pagesRes.error || linksRes.error) {
        setError("Couldn't load your knowledge graph — try refreshing.");
        setLoading(false);
        return;
      }

      const pages = (pagesRes.data ?? []) as WikiPage[];
      const links = (linksRes.data ?? []) as PageLink[];
      setAllPages(pages);
      setAllLinks(links);
      setLoading(false);

      if (pages.length === 0) return;

      // Determine focal node
      const initial = focusParam
        ? (pages.find((p) => p.id === focusParam) ?? pages[0])
        : pages[0];

      setFocusId(initial.id);

      // Build initial visibleIds: focal + direct neighbors
      const neighborIds = links
        .filter(
          (l) => l.source_page_id === initial.id || l.target_page_id === initial.id,
        )
        .map((l) =>
          l.source_page_id === initial.id ? l.target_page_id : l.source_page_id,
        );

      const ids = new Set([initial.id, ...neighborIds]);
      setVisibleIds(ids);
    }

    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Recompute React Flow nodes/edges when visible set changes ─────────────
  useEffect(() => {
    if (!focusId || visibleIds.size === 0) return;
    const newNodes = computeLayout(allPages, allLinks, focusId, visibleIds);
    const newEdges = computeEdges(allLinks, visibleIds);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [allPages, allLinks, focusId, visibleIds, setNodes, setEdges]);

  // ── Expand: add direct neighbors of a node to visibleIds ──────────────────
  const handleExpand = useCallback((nodeId: string) => {
    const { allLinks, visibleIds } = stateRef.current;
    const neighborIds = allLinks
      .filter((l) => l.source_page_id === nodeId || l.target_page_id === nodeId)
      .map((l) =>
        l.source_page_id === nodeId ? l.target_page_id : l.source_page_id,
      );
    setVisibleIds((prev) => new Set([...prev, ...neighborIds]));
  }, []);

  // ── Derived: is every neighbor of the selected node already visible? ───────
  const allNeighborsVisible = useMemo(() => {
    if (!selectedNodeId) return true;
    const neighborIds = allLinks
      .filter(
        (l) =>
          l.source_page_id === selectedNodeId ||
          l.target_page_id === selectedNodeId,
      )
      .map((l) =>
        l.source_page_id === selectedNodeId
          ? l.target_page_id
          : l.source_page_id,
      );
    return neighborIds.every((id) => visibleIds.has(id));
  }, [selectedNodeId, allLinks, visibleIds]);

  const selectedPage = useMemo(
    () => allPages.find((p) => p.id === selectedNodeId) ?? null,
    [selectedNodeId, allPages],
  );

  const visibleNodeCount = visibleIds.size;
  const visibleEdgeCount = edges.length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-5 h-10 border-b border-gray-800 shrink-0">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors group"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-0.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to wiki
        </button>

        <span className="text-sm font-semibold text-gray-200">Knowledge Graph</span>

        <span className="text-xs text-gray-500">
          {loading ? "" : `${visibleNodeCount} pages · ${visibleEdgeCount} connections`}
        </span>
      </header>

      {/* Body */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">Loading your knowledge graph…</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && allPages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-gray-300 font-medium">Your wiki is empty</p>
              <p className="text-sm text-gray-500">
                Start adding knowledge to see it here.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && allPages.length > 0 && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_evt, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2}
            className="bg-gray-950"
          >
            <Background color="#374151" gap={24} size={1} />
            <Controls
              className="[&_button]:bg-gray-800 [&_button]:border-gray-700 [&_button]:text-gray-300 [&_button:hover]:bg-gray-700"
            />
          </ReactFlow>
        )}

        {/* Slide-in panel */}
        {selectedPage && (
          <GraphPagePanel
            page={selectedPage}
            allNeighborsVisible={allNeighborsVisible}
            onExpand={() => handleExpand(selectedPage.id)}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}
