"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconMessageDots,
  IconX,
} from "@tabler/icons-react";
import {
  DEFAULT_QUICK_PROMPTS,
  type AssistantLink,
  type AssistantReply,
} from "@/lib/assistant";

interface ChatItem {
  id: string;
  role: "bot" | "user";
  text: string;
  time?: string;
  links?: AssistantLink[];
  whatsappUrl?: string;
  whatsappLabel?: string;
}

function nowLabel() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_QUICK_PROMPTS);
  const [messages, setMessages] = useState<ChatItem[]>(() => [
    {
      id: "welcome-1",
      role: "bot",
      text: "Halo 👋 Selamat datang di TechFixSoftware.",
      time: "",
    },
    {
      id: "welcome-2",
      role: "bot",
      text: "Apa yang ingin Anda konsultasikan seputar servis software Android?",
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Isi jam sambutan di client saja agar tidak memicu hydration mismatch.
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === "welcome-1" && !m.time ? { ...m, time: nowLabel() } : m))
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text || loading) return;

    const userMsg: ChatItem = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSuggestions([]);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const payload = (await res.json()) as {
        success?: boolean;
        data?: AssistantReply;
        error?: { message?: string };
      };

      if (!res.ok || !payload.success || !payload.data) {
        throw new Error(payload.error?.message || "Gagal memproses pesan.");
      }

      const reply = payload.data;
      const stamp = nowLabel();
      const botItems: ChatItem[] = reply.messages.map((msg, idx) => {
        const isLast = idx === reply.messages.length - 1;
        return {
          id: `b-${Date.now()}-${idx}`,
          role: "bot",
          text: msg,
          time: idx === 0 ? stamp : undefined,
          links: isLast ? reply.links : undefined,
          whatsappUrl: isLast ? reply.whatsappUrl : undefined,
          whatsappLabel: isLast ? reply.whatsappLabel : undefined,
        };
      });

      setMessages((prev) => [...prev, ...botItems]);
      if (reply.suggestions?.length) {
        setSuggestions(reply.suggestions);
      }
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Maaf, koneksi sedang terganggu. Silakan coba lagi atau gunakan form konsultasi.";
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "bot",
          text: errMsg,
          links: [{ label: "Buka Form Konsultasi", href: "/#konsultasi" }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-5 sm:right-5">
      {open && (
        <section
          id="tfs-chat-panel"
          role="dialog"
          aria-label="Asisten TechFixSoftware"
          className="mb-3 flex w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_24px_60px_-16px_rgba(11,18,32,0.34)]"
        >
          {/* Header: Navy brand + indikator online emerald */}
          <header className="relative flex items-center justify-between gap-3 bg-[#0B1220] px-4 py-3.5 text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 65% 120% at 0% 100%, rgba(16,185,129,0.28), transparent 70%)",
              }}
            />
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 font-heading text-sm font-bold tracking-tight text-white">
                T
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-2 w-2 rounded-[2px] bg-[#14B8A6]"
                />
              </div>
              <div>
                <p className="font-heading text-sm font-bold leading-tight text-white">
                  TechFixSoftware
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#cbd5e1]">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-2 rounded-full bg-[#34d399]"
                  />
                  Online &middot; siap membantu
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label="Tutup jendela chat"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EE7B7]"
            >
              <IconX className="h-5 w-5" />
            </button>
          </header>

          {/* Area percakapan */}
          <div
            ref={listRef}
            className="flex max-h-[min(410px,calc(100dvh-15.5rem))] min-h-[260px] flex-col gap-2.5 overflow-y-auto bg-[#f4f7f6] px-4 py-4"
          >
            {messages.map((item) =>
              item.role === "user" ? (
                <div key={item.id} className="flex justify-end">
                  <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[image:var(--cta-gradient)] px-3.5 py-2.5 text-sm font-medium leading-relaxed text-[#041a14] shadow-xs">
                    {item.text}
                  </div>
                </div>
              ) : (
                <div key={item.id} className="flex justify-start">
                  <div className="max-w-[88%] space-y-2 rounded-2xl rounded-bl-sm border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[var(--color-fg)] shadow-xs">
                    <p>{item.text}</p>

                    {item.links && item.links.length > 0 && (
                      <div className="flex flex-col gap-1 pt-0.5">
                        {item.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-2 hover:text-[var(--color-accent)]"
                          >
                            {link.label}
                            <IconArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {item.whatsappUrl && (
                      <a
                        href={item.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0F766E] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#0D9488] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
                      >
                        <IconBrandWhatsapp className="h-4 w-4 shrink-0" />
                        {item.whatsappLabel || "Lanjut ke WhatsApp"}
                      </a>
                    )}

                    {item.time && (
                      <span className="block text-[11px] text-[var(--color-muted)]">
                        {item.time}
                      </span>
                    )}
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex justify-start">
                <div
                  aria-label="Asisten sedang mengetik"
                  className="inline-flex items-center gap-1 rounded-2xl rounded-bl-sm border border-[var(--color-border)] bg-white px-3.5 py-3 shadow-xs"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)] [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="cursor-pointer rounded-full border border-[#0F766E]/25 bg-white px-3 py-1.5 text-left text-xs font-medium text-[var(--color-secondary)] transition-colors hover:border-[var(--color-accent)] hover:bg-[#eaf2ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input pesan */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
            className="border-t border-[var(--color-border)] bg-white px-3 pb-2.5 pt-3"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tulis pesan..."
                maxLength={400}
                aria-label="Tulis pesan ke asisten TechFixSoftware"
                className="h-11 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Kirim pesan"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#0B1220] text-white transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
              >
                <IconArrowUpRight className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-[var(--color-muted)]">
              Asisten otomatis <span className="font-semibold text-[var(--color-primary)]">TechFixSoftware</span>
            </p>
          </form>
        </section>
      )}

      {/* Floating launcher button */}
      <div className="flex justify-end">
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="tfs-chat-panel"
          aria-label={open ? "Tutup asisten TechFixSoftware" : "Buka asisten TechFixSoftware"}
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-[image:var(--cta-gradient)] text-[#041a14] shadow-[0_10px_28px_rgba(16,185,129,0.36)] transition-transform duration-150 hover:scale-[1.03] hover:brightness-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          {open ? (
            <IconX className="h-6 w-6" stroke={2.25} />
          ) : (
            <IconMessageDots className="h-6 w-6" stroke={2.1} />
          )}
        </button>
      </div>
    </div>
  );
}
