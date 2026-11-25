import type { CachedArticle, CachedService } from "@/lib/public-data";

const STOPWORDS = new Set([
  "yang",
  "dan",
  "atau",
  "untuk",
  "dengan",
  "pada",
  "cara",
  "apa",
  "itu",
  "ini",
  "dari",
  "ke",
  "di",
  "android",
  "hp",
  "ponsel",
  "perangkat",
  "servis",
  "software",
  "system",
  "pemulihan",
  "panduan",
  "risiko",
  "aman",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/[\s-]+/)
      .filter((token) => token.length >= 3 && !STOPWORDS.has(token))
  );
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  let score = 0;
  for (const token of a) {
    if (b.has(token)) score += 1;
  }
  return score;
}

export function pickRelatedArticlesForService(
  service: Pick<CachedService, "slug" | "name" | "category" | "description">,
  articles: CachedArticle[],
  limit = 3
): CachedArticle[] {
  const serviceTokens = tokenize(
    `${service.slug} ${service.name} ${service.category} ${service.description}`
  );

  return articles
    .map((article, index) => ({
      article,
      index,
      score: overlapScore(serviceTokens, tokenize(`${article.slug} ${article.title}`)),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.article);
}

export function pickRelatedServicesForArticle(
  article: Pick<CachedArticle, "slug" | "title" | "metaDescription">,
  services: CachedService[],
  limit = 2
): CachedService[] {
  const articleTokens = tokenize(
    `${article.slug} ${article.title} ${article.metaDescription ?? ""}`
  );

  return services
    .map((service, index) => ({
      service,
      index,
      score: overlapScore(articleTokens, tokenize(`${service.slug} ${service.name} ${service.category}`)),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.service);
}

export function pickRelatedArticles(
  current: Pick<CachedArticle, "id" | "slug" | "title">,
  articles: CachedArticle[],
  limit = 3
): CachedArticle[] {
  const currentTokens = tokenize(`${current.slug} ${current.title}`);

  return articles
    .filter((item) => item.id !== current.id)
    .map((article, index) => ({
      article,
      index,
      score: overlapScore(currentTokens, tokenize(`${article.slug} ${article.title}`)),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.article);
}
