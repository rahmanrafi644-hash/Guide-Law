"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LegalResponseFormatterProps {
  content: string;
  isStreaming?: boolean;
}

export const LegalResponseFormatter: React.FC<LegalResponseFormatterProps> = ({
  content,
  isStreaming = false,
}) => {
  return (
    <div className={`answer ${isStreaming ? "caret" : ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
