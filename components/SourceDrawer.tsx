"use client";

import React, { useEffect } from "react";
import { X, ArrowUpRight, Download } from "lucide-react";
import { CitationItem } from "@/lib/types";

interface SourceDrawerProps {
  citation: CitationItem | null;
  onClose: () => void;
}

export const SourceDrawer: React.FC<SourceDrawerProps> = ({ citation, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!citation) return null;

  const pdfUrl = `/docs/${citation.sourcePdf}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={onClose} className="fixed inset-0 bg-ink/30 backdrop-blur-[2px]" />

      <aside className="relative w-full max-w-md bg-surface border-l border-line h-full shadow-2xl flex flex-col z-10 animate-rise">
        <div className="px-6 pt-6 pb-5 border-b border-line flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] tracking-[0.14em] uppercase text-brass font-medium">
              {citation.actName}
            </p>
            <h2 className="mt-2 font-serif text-[22px] leading-snug font-semibold">
              Section {citation.sectionNumber}
              {citation.sectionTitle ? ` — ${citation.sectionTitle}` : ""}
            </h2>
            {citation.chapter && (
              <p className="mt-2 text-[13px] text-muted">{citation.chapter}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg text-muted hover:text-ink hover:bg-sunken transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <p className="text-[12px] tracking-[0.14em] uppercase text-faint font-medium mb-3">
            Text of the provision
          </p>
          <div className="font-serif text-[16px] leading-[1.8] whitespace-pre-wrap select-text">
            {citation.snippet}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-line flex items-center justify-between gap-3">
          <span className="text-[12px] text-faint truncate">
            {citation.sourcePdf} · {citation.sourcePageRange}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium bg-ink text-bg hover:opacity-90 transition-opacity"
            >
              Open PDF
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </a>
            <a
              href={pdfUrl}
              download={citation.sourcePdf}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-line text-muted hover:text-ink hover:bg-sunken transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
};
