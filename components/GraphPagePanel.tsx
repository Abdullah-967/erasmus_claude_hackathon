"use client";

import type { WikiPage } from "@/types/database";
import { useRouter } from "next/navigation";

interface Props {
  page: WikiPage;
  allNeighborsVisible: boolean;
  onExpand: () => void;
  onClose: () => void;
}

export default function GraphPagePanel({ page, allNeighborsVisible, onExpand, onClose }: Props) {
  const router = useRouter();

  return (
    <div className="absolute right-0 top-0 h-full w-[300px] bg-gray-900 border-l border-gray-800 flex flex-col z-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <h2 className="text-base font-bold text-gray-100 leading-snug pr-4">
          {page.title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors mt-0.5"
          aria-label="Close panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5">
        {/* Summary */}
        {page.summary && (
          <p className="text-sm text-gray-400 leading-relaxed">{page.summary}</p>
        )}

        {/* Key Points */}
        {page.key_points.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Key Points
            </p>
            <ul className="space-y-1.5">
              {page.key_points.map((point, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static ordered list
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-gray-600 select-none shrink-0 mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-gray-800 space-y-2">
        <button
          type="button"
          onClick={onExpand}
          disabled={allNeighborsVisible}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Expand connections
        </button>
        <button
          type="button"
          onClick={() => router.push(`/?page=${page.id}`)}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors"
        >
          Open full page →
        </button>
      </div>
    </div>
  );
}
