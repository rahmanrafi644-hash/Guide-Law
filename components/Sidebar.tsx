"use client";

import React from "react";
import { SquarePen, Trash2, X } from "lucide-react";
import { Chat } from "@/lib/types";

interface SidebarProps {
  chats: Chat[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function groupLabel(ts: number): string {
  const day = 86400000;
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  if (ts >= startOfToday) return "Today";
  if (ts >= startOfToday - day) return "Yesterday";
  if (ts >= startOfToday - 7 * day) return "Previous 7 days";
  return "Older";
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeId,
  open,
  onClose,
  onSelect,
  onNew,
  onDelete,
}) => {
  const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups: { label: string; items: Chat[] }[] = [];
  for (const c of sorted) {
    const label = groupLabel(c.updatedAt);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(c);
    else groups.push({ label, items: [c] });
  }

  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 z-40 bg-ink/30 md:hidden" />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-72 shrink-0 flex flex-col bg-sunken border-r border-line transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full md:hidden"
        }`}
      >
        <div className="h-14 px-3 flex items-center justify-between">
          <button
            onClick={() => {
              onNew();
              onClose();
            }}
            className="flex-1 flex items-center gap-2.5 h-9 px-3 rounded-lg text-[14px] font-medium hover:bg-surface transition-colors"
          >
            <SquarePen className="w-4 h-4" strokeWidth={1.75} />
            New consultation
          </button>
          <button
            onClick={onClose}
            className="md:hidden ml-1 p-2 rounded-lg text-muted hover:text-ink"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {chats.length === 0 ? (
            <p className="px-3 pt-6 text-[13px] text-faint leading-relaxed">
              Your conversations will appear here.
            </p>
          ) : (
            groups.map((g) => (
              <div key={g.label} className="mt-4">
                <p className="px-3 mb-1 text-[11.5px] tracking-[0.12em] uppercase text-faint font-medium">
                  {g.label}
                </p>
                <ul>
                  {g.items.map((c) => (
                    <li key={c.id} className="group relative">
                      <button
                        onClick={() => {
                          onSelect(c.id);
                          onClose();
                        }}
                        className={`w-full text-left h-9 pl-3 pr-9 rounded-lg text-[14px] truncate transition-colors ${
                          c.id === activeId ? "bg-surface text-ink" : "text-muted hover:bg-surface hover:text-ink"
                        }`}
                        title={c.title}
                      >
                        {c.title}
                      </button>
                      <button
                        onClick={() => onDelete(c.id)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-faint hover:text-ink opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};
