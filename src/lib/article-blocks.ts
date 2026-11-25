export type ArticleBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

const BULLET_PREFIX = /^(?:•|-|\*)\s+/;
const SUBHEADING_COLON_MAX = 54;
const LEAD_IN_HINTS = /(?:berikut|adalah|seperti|ketika|yaitu|meliputi|antara lain):$/i;

function isNumberedSubheading(line: string) {
  return /^\d+\.\s+[A-Z0-9]/.test(line) && line.length <= 85 && !line.endsWith(".");
}

function isColonSubheading(line: string) {
  return (
    line.endsWith(":") &&
    line.length <= SUBHEADING_COLON_MAX &&
    !LEAD_IN_HINTS.test(line) &&
    !/[.,;]/.test(line.slice(0, -1))
  );
}

function isSectionHeading(line: string, nextLine: string | undefined) {
  if (!nextLine || line.length > 92 || BULLET_PREFIX.test(line)) return false;
  if (line.endsWith(".") || line.endsWith("!") || line.endsWith(":")) return false;
  if (/^\d+\.\s+/.test(line)) return false;
  // Baris judul selalu diawali huruf kapital/angka dan bukan kalimat panjang.
  return /^[A-Z0-9"'\u201c]/.test(line);
}

/**
 * Mengubah konten artikel (teks polos tersegmentasi maupun Markdown sederhana)
 * menjadi blok semantik H2/H3/P/UL untuk keterbacaan Google & Answer Engine
 * tanpa memerlukan migrasi data pada artikel yang sudah ada.
 */
export function parseArticleBlocks(content: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  const rawLines = content.replace(/\r\n/g, "\n").split("\n");

  let index = 0;
  let seenH2 = false;

  while (index < rawLines.length) {
    const line = rawLines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    // Dukungan Markdown eksplisit untuk artikel baru dari CMS.
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      seenH2 = true;
      index += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: seenH2 ? "h3" : "h2", text: line.slice(4).trim() });
      seenH2 = true;
      index += 1;
      continue;
    }

    // Kelompokkan baris bullet berurutan menjadi satu <ul>.
    if (BULLET_PREFIX.test(line)) {
      const items: string[] = [];
      while (index < rawLines.length) {
        const current = rawLines[index].trim();
        if (!BULLET_PREFIX.test(current)) break;
        items.push(current.replace(BULLET_PREFIX, "").trim());
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Cari baris non-kosong berikutnya untuk membedakan heading dari paragraf.
    let nextNonEmpty: string | undefined;
    for (let j = index + 1; j < rawLines.length; j += 1) {
      const candidate = rawLines[j].trim();
      if (candidate) {
        nextNonEmpty = candidate;
        break;
      }
    }

    if (isNumberedSubheading(line) || isColonSubheading(line)) {
      // Hindari lompat level h1 -> h3 jika belum ada h2 sebelumnya.
      blocks.push({
        type: seenH2 ? "h3" : "h2",
        text: line.replace(/:$/, ""),
      });
      seenH2 = true;
      index += 1;
      continue;
    }

    // Heading diikuti langsung oleh baris berikutnya (tanpa baris kosong pemisah)
    // atau oleh bullet list setelah baris kosong.
    const immediateNext = rawLines[index + 1]?.trim();
    const followedDirectly = Boolean(immediateNext && !BULLET_PREFIX.test(immediateNext));
    const followedByList = Boolean(nextNonEmpty && BULLET_PREFIX.test(nextNonEmpty));

    if ((followedDirectly || followedByList) && isSectionHeading(line, nextNonEmpty)) {
      blocks.push({ type: "h2", text: line });
      seenH2 = true;
      index += 1;
      continue;
    }

    blocks.push({ type: "p", text: line });
    index += 1;
  }

  return blocks;
}
