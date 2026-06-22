import { slugify } from "./slugify";
import type { TocHeading } from "./types";

const LANG_OPEN = /^:::lang\{(\w+)\}\s*$/;
const LANG_CLOSE = /^:::\s*$/;

interface LangBlock {
  locale: string;
  lines: string[];
}

/**
 * Сводит подряд идущие `:::lang{xx}`-блоки к строкам активной локали (иначе
 * языка по умолчанию, иначе первого блока). Строки вне блоков остаются как есть.
 * Повторяет логику выбора LangSwitch, чтобы TOC соответствовал странице.
 */
function resolveLangBlocks(
  lines: string[],
  locale: string,
  defaultLocale: string,
): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (!LANG_OPEN.test(lines[i])) {
      out.push(lines[i]);
      i++;
      continue;
    }
    const group: LangBlock[] = [];
    while (i < lines.length) {
      const match = lines[i].match(LANG_OPEN);
      if (!match) break;
      i++; // пропускаем открывающую строку
      const blockLines: string[] = [];
      while (i < lines.length && !LANG_CLOSE.test(lines[i])) {
        blockLines.push(lines[i]);
        i++;
      }
      i++; // пропускаем закрывающую строку
      group.push({ locale: match[1], lines: blockLines });
      // допускаем пустые строки между блоками одной группы
      let j = i;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j < lines.length && LANG_OPEN.test(lines[j])) i = j;
      else break;
    }
    const picked =
      group.find((b) => b.locale === locale) ??
      group.find((b) => b.locale === defaultLocale) ??
      group[0];
    if (picked) out.push(...picked.lines);
  }
  return out;
}

export function extractHeadings(
  source: string,
  locale = "",
  defaultLocale = "",
): TocHeading[] {
  const headings: TocHeading[] = [];
  const inCodeBlock = { value: false };

  const lines = resolveLangBlocks(source.split("\n"), locale, defaultLocale);
  for (const line of lines) {
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
