"use client";

import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { CitationItem } from "@/lib/types";

interface StatuteExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (citation: CitationItem) => void;
}

export const StatuteExplorerModal: React.FC<StatuteExplorerModalProps> = ({
  isOpen,
  onClose,
  onSelectSection,
}) => {
  const [selectedAct, setSelectedAct] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statutes, setStatutes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStatutes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedAct !== "all") params.append("actId", selectedAct);
        if (searchQuery.trim()) params.append("q", searchQuery.trim());

        const res = await fetch(`/api/statutes?${params.toString()}`);
        const data = await res.json();
        setStatutes(data.statutes || []);
      } catch (e) {
        console.error("Failed to load statutes:", e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchStatutes, 200);
    return () => clearTimeout(timer);
  }, [isOpen, selectedAct, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div onClick={onClose} className="fixed inset-0 bg-ink/30 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-3xl max-h-[88vh] bg-surface border border-line rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden animate-rise">
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-[22px] font-semibold">Statutes</h2>
            <p className="text-[13px] text-muted">The five Acts, section by section.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-sunken transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-6 pb-4 space-y-3 border-b border-line">
          <div className="relative">
            <Search className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Section number or concept — 138, dishonour, defective goods…"
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-sunken border border-transparent focus:border-brass text-[14px] placeholder:text-faint outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[13px]">
            {[
              { id: "all", label: "All" },
              { id: "contract_1872", label: "Contract 1872" },
              { id: "sale_of_goods_1930", label: "Sale of Goods 1930" },
              { id: "ni_1881", label: "Negotiable Instruments 1881" },
              { id: "partnership_1932", label: "Partnership 1932" },
              { id: "companies_1994", label: "Companies 1994" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedAct(tab.id)}
                className={`h-8 px-3 rounded-full whitespace-nowrap transition-colors ${
                  selectedAct === tab.id
                    ? "bg-ink text-bg"
                    : "text-muted hover:text-ink hover:bg-sunken"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center text-[13px] text-faint animate-blink">Searching…</div>
          ) : statutes.length === 0 ? (
            <div className="py-16 text-center text-[14px] text-faint">No sections match your search.</div>
          ) : (
            <ul className="divide-y divide-line">
              {statutes.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() =>
                      onSelectSection({
                        id: s.id,
                        actName: s.actName,
                        sectionNumber: s.sectionNumber,
                        sectionTitle: s.sectionTitle,
                        chapter: s.chapter,
                        sourcePdf: s.sourcePdf,
                        sourcePageRange: s.sourcePageRange,
                        snippet: s.text,
                        verified: true,
                      })
                    }
                    className="w-full text-left px-6 py-4 hover:bg-sunken transition-colors"
                  >
                    <div className="flex items-baseline gap-2 text-[12px] text-faint">
                      <span className="font-medium text-brass">§ {s.sectionNumber}</span>
                      <span>{s.actName}</span>
                    </div>
                    <h3 className="mt-0.5 font-medium text-[15px]">{s.sectionTitle}</h3>
                    <p className="text-[13px] text-muted mt-1 line-clamp-2">{s.snippet || s.text}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
