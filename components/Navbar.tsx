"use client";

import React from "react";
import { QrCode, PanelLeft } from "lucide-react";

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenQR: () => void;
  onHome: () => void;
}

const iconBtn =
  "inline-flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] text-muted hover:text-ink hover:bg-sunken transition-colors";

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenQR, onHome }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-bg/80 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={onToggleSidebar} className={`${iconBtn} !px-2`} title="Chat history">
            <PanelLeft className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>
          <button onClick={onHome} className="flex items-center gap-2.5 ml-1" title="Guide Law home">
            <img src="/logo.png" alt="Guide Law" className="w-8 h-8 rounded-full" />
            <span className="font-serif text-[19px] font-semibold tracking-tight">Guide Law</span>
          </button>
        </div>

        <button onClick={onOpenQR} className={iconBtn} title="Open on mobile">
          <QrCode className="w-4 h-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">Mobile</span>
        </button>
      </div>
    </header>
  );
};
