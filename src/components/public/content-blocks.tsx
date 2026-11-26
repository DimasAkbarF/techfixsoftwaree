import type { ArticleBlock } from "@/lib/article-blocks";

/** Render blok konten (h2/h3/paragraf/list) yang sama untuk artikel dan detail layanan. */
export function ContentBlocks({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-4 font-sans text-base leading-relaxed text-[var(--color-fg)]">
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2
              key={index}
              className="pt-4 font-heading text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-primary)]"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3
              key={index}
              className="pt-2 font-heading text-base sm:text-lg font-semibold text-[var(--color-primary)]"
            >
              {block.text}
            </h3>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={index} className="list-disc space-y-2 pl-5 text-[var(--color-fg)]">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}
