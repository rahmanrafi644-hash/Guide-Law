"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { LandingHero } from "@/components/LandingHero";
import { LegalResponseFormatter } from "@/components/LegalResponseFormatter";
import { QRCodeModal } from "@/components/QRCodeModal";
import { Chat, ChatMessage, ScenarioExample } from "@/lib/types";

const STORAGE_KEY = "guide-law:chats:v1";

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Chat[]) : [];
  } catch {
    return [];
  }
}

function makeTitle(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > 44 ? t.slice(0, 44).trimEnd() + "…" : t;
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<string>("");
  const [isQROpen, setIsQROpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find((c) => c.id === activeId) || null;
  const messages = activeChat?.messages || [];

  // Load saved chats once; open the sidebar by default on desktop
  useEffect(() => {
    setChats(loadChats());
    setSidebarOpen(window.matchMedia("(min-width: 768px)").matches);
    setHydrated(true);
  }, []);

  // Persist chats (skip while a reply is streaming to avoid a write per token)
  useEffect(() => {
    if (!hydrated || isLoading) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      /* storage unavailable — history just won't persist */
    }
  }, [chats, hydrated, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStage, isLoading]);

  const updateChat = (id: string, fn: (c: Chat) => Chat) =>
    setChats((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const now = Date.now();
    const userMsg: ChatMessage = {
      id: `user-${now}`,
      role: "user",
      content: textToSend,
      timestamp: now,
    };

    // Reuse the open chat, or start a new one
    let chatId = activeId;
    let history: ChatMessage[];
    if (activeChat) {
      history = [...activeChat.messages, userMsg];
      updateChat(activeChat.id, (c) => ({ ...c, messages: history, updatedAt: now }));
    } else {
      chatId = `chat-${now}`;
      history = [userMsg];
      const fresh: Chat = {
        id: chatId,
        title: makeTitle(textToSend),
        messages: history,
        createdAt: now,
        updatedAt: now,
      };
      setChats((prev) => [fresh, ...prev]);
      setActiveId(chatId);
    }

    const targetId = chatId as string;
    setIsLoading(true);
    setCurrentStage("Reading the statutes…");

    const assistantMsgId = `asst-${now}`;
    let streamedContent = "";

    const writeAssistant = (content: string) =>
      updateChat(targetId, (c) => {
        const exists = c.messages.some((m) => m.id === assistantMsgId);
        const messages: ChatMessage[] = exists
          ? c.messages.map((m) => (m.id === assistantMsgId ? { ...m, content } : m))
          : [...c.messages, { id: assistantMsgId, role: "assistant", content, timestamp: Date.now() }];
        return { ...c, messages, updatedAt: Date.now() };
      });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available from response");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const eventMatch = block.match(/event:\s*([^\n]+)/);
          const dataMatch = block.match(/data:\s*([^\n]+)/);
          if (!eventMatch || !dataMatch) continue;

          const eventType = eventMatch[1].trim();
          const data = JSON.parse(dataMatch[1].trim());

          if (eventType === "stage") {
            setCurrentStage(data.stage);
          } else if (eventType === "token") {
            streamedContent += data.token;
            writeAssistant(streamedContent);
          } else if (eventType === "error") {
            throw new Error(data.error);
          }
        }
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      writeAssistant(
        `${streamedContent ? streamedContent + "\n\n" : ""}**Guide Law could not complete the analysis.**\n\n${
          err.message || "Please check your connection and try again."
        }`
      );
    } finally {
      setIsLoading(false);
      setCurrentStage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectScenario = (scenario: ScenarioExample) => handleSend(scenario.query);

  const handleNewChat = () => {
    if (isLoading) return;
    setActiveId(null);
    setInput("");
  };

  const handleSelectChat = (id: string) => {
    if (isLoading) return;
    setActiveId(id);
  };

  const handleDeleteChat = (id: string) => {
    if (isLoading) return;
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (id === activeId) setActiveId(null);
  };

  const lastMsg = messages[messages.length - 1];
  const isStreamingReply = isLoading && lastMsg?.role === "assistant";

  return (
    <div className="flex-1 flex min-h-screen">
      <Sidebar
        chats={chats}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSelectChat}
        onNew={handleNewChat}
        onDelete={handleDeleteChat}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          onOpenQR={() => setIsQROpen(true)}
          onHome={handleNewChat}
        />

        <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center">
              <LandingHero
                onStart={() => textareaRef.current?.focus()}
                onSelectScenario={handleSelectScenario}
              />
            </div>
          ) : (
            <div className="flex-1 py-8 space-y-10">
              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end animate-rise">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-sunken px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex gap-3.5 animate-rise">
                    <img src="/logo.png" alt="" className="w-7 h-7 mt-0.5 rounded-full shrink-0" />
                    <div className="min-w-0 flex-1">
                      <LegalResponseFormatter
                        content={msg.content}
                        isStreaming={isStreamingReply && i === messages.length - 1}
                      />
                    </div>
                  </div>
                )
              )}

              {isLoading && lastMsg?.role === "user" && (
                <div className="flex items-center gap-3.5 text-[14px] text-muted animate-rise">
                  <img src="/logo.png" alt="" className="w-7 h-7 rounded-full shrink-0 animate-blink" />
                  <span>{currentStage || "Reading the statutes…"}</span>
                </div>
              )}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}

          <div className="sticky bottom-0 z-20 pt-3 pb-4 bg-gradient-to-t from-bg via-bg to-transparent">
            <div className="flex items-end gap-2 rounded-3xl border border-line bg-surface pl-5 pr-2 py-2 shadow-[0_2px_16px_-6px_rgb(0_0_0/0.12)] focus-within:border-faint transition-colors">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Describe your dispute or ask a question of law…"
                className="flex-1 py-2 bg-transparent text-[15px] placeholder:text-faint outline-none resize-none max-h-40 leading-relaxed"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="h-9 w-9 shrink-0 mb-0.5 rounded-full flex items-center justify-center bg-ink text-bg disabled:opacity-25 disabled:cursor-not-allowed hover:opacity-85 transition-opacity"
                title="Send (Enter)"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" strokeWidth={2.25} />}
              </button>
            </div>

            <p className="mt-2.5 text-center text-[11.5px] text-faint">
              Academic research tool for the UIU Business Law Competition. Not formal legal advice.
            </p>
          </div>
        </main>
      </div>

      <QRCodeModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
    </div>
  );
}
