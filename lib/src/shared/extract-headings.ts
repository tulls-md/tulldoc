import { slugify } from "./slugify";
import type { TocHeading } from "./types";

export function extractHeadings(source: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const inCodeBlock = { value: false };

  for (const line of source.split("\n")) {
    if (line.startsWith("```")) {
      inCodeBlock.value = !inCodeBlock.value;
      continue;
    }
    if (inCodeBlock.value) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const text = match[2].replace(/`[^`]+`/g, (m) => m.slice(1, -1)).trim();
      headings.push({ level: match[1].length, text, id: slugify(text) });
    }
  }

  return headings;
}
