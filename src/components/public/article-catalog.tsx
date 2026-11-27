"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { IconArticle, IconSearch, IconX } from "@tabler/icons-react";

export type ArticleTopic =
  | "Root & UBL"
  | "Bootloop & Unbrick"
  | "Custom ROM & Recovery"
  | "Firmware & Partisi";

export interface ArticleCatalogItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl: string | null;
  publishedLabel: string;
  topic: ArticleTopic;
}

const TOPICS: Array<"ALL" | ArticleTopic> = [
  "ALL",
  "Root & UBL",
  "Bootloop & Unbrick",
  "Custom ROM & Recovery",
  "Firmware & Partisi",
];

export function ArticleCatalog({ articles }: { articles: ArticleCatalogItem[] }) {
  const [query, setQuery] = React.useState("");
  const [selectedTopic, setSelectedTopic] = React.useState<"ALL" | ArticleTopic>("ALL");

  const topicCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    counts.set("ALL", articles.length);
    for (const item of articles) {
      counts.set(item.topic, (counts.get(item.topic) ?? 0) + 1);
    }
    return counts;
  }, [articles]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((item) => {
      const matchTopic = selectedTopic === "ALL" || item.topic === selectedTopic;
      const matchQuery =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q);
      return matchTopic && matchQuery;
    });
  }, [articles, query, selectedTopic]);

  return (
    <div className="space-y-8">
      {/* Toolbar pencarian & filter topik */}
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {TOPICS.map((topic) => {
            const count = topicCounts.get(topic) ?? 0;
            if (topic !== "ALL" && count === 0) return null;
            const active = selectedTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-primary)] text-white"
                    : "border border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-fg)] hover:border-[var(--color-primary)]/40"
                }`}
              >
                {topic === "ALL" ? `Semua (${count})` : `${topic} (${count})`}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari panduan (mis. bootloop, magisk...)"
            aria-label="Cari artikel"
            className="h-9 pl-9 pr-8 text-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-primary)] cursor-pointer"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/85 p-10 text-center">
          <IconArticle className="mx-auto mb-3 h-9 w-9 text-[var(--color-muted)]" />
          <h2 className="font-heading text-base font-semibold text-[var(--color-primary)]">
            Artikel tidak ditemukan
          </h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Coba kata kunci lain atau pilih kategori &ldquo;Semua&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
          {filtered.map((article) => (
            <article key={article.id} className="border-t border-[var(--color-border)] pt-4">
              <Link
                href={`/articles/${article.slug}`}
                prefetch={true}
                className="group flex flex-col gap-2.5"
              >
                {article.coverImageUrl && (
                  <div className="mb-1 aspect-[16/9] overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[#F9FAFB]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  <span>{article.publishedLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[var(--color-secondary)]">{article.topic}</span>
                </div>

                <h2 className="font-heading text-sm font-bold leading-snug text-[var(--color-primary)] line-clamp-3 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 sm:text-base lg:text-lg">
                  {article.title}
                </h2>

                <div className="hidden sm:block">
                  <p className="text-sm leading-relaxed text-[var(--color-muted)] line-clamp-2">
                    {article.summary}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
