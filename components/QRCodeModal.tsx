"use client";

import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "https://guide-law.vercel.app";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Always render the code dark-on-white so it scans in both themes
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&data=${encodeURIComponent(currentUrl)}&color=0f1b3a&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-ink/30 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-xs bg-surface border border-line rounded-2xl shadow-2xl p-6 text-center z-10 animate-rise">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-muted hover:text-ink hover:bg-sunken transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>

        <img src="/logo.png" alt="Guide Law" className="w-14 h-14 mx-auto mb-3 rounded-full" />
        <h3 className="font-serif text-[20px] font-semibold">Open on mobile</h3>
        <p className="text-[13px] text-muted mt-1 mb-5">Scan to try a scenario on your phone.</p>

        <div className="inline-block p-3 bg-white rounded-xl border border-line mb-5">
          <img src={qrImageUrl} alt="Guide Law mobile QR code" className="w-44 h-44 object-contain" />
        </div>

        <div className="flex items-center gap-2 pl-3 pr-1 h-10 rounded-lg bg-sunken">
          <span className="text-[12px] font-mono text-muted truncate flex-1 text-left">{currentUrl}</span>
          <button
            onClick={handleCopy}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-surface transition-colors shrink-0"
            title="Copy link"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
