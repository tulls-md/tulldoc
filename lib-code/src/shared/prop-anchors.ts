import { slugify } from "@tulls-md/tulldoc";
import type { PropRow } from "./types";

/** Префикс якорей строк API-таблицы: "Card.Root" -> "props-card-root" */
export function propsAnchorPrefix(componentName: string): string {
  return `props-${slugify(componentName.replaceAll(".", " "))}`;
}

export function propAnchor(prefix: string, propName: string): string {
  return `${prefix}-${slugify(propName)}`;
}

/** Карта имя-пропа -> #якорь для автолинковки `упоминаний` в Markdown */
export function propCodeLinks(
  rows: PropRow[],
  prefix: string,
): Record<string, string> {
  return Object.fromEntries(
    rows.map((row) => [row.name, `#${propAnchor(prefix, row.name)}`]),
  );
}
