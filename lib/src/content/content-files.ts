import { existsSync, readdirSync } from "fs";
import { join } from "path";

export const MDX_EXT = ".mdx";
export const DOC_EXT = ".doc.tsx";
/** Папка с этим префиксом - табовый документ, без него - группа */
export const TAB_DIR_PREFIX = "_";

export function isContentFile(name: string): boolean {
  return name.endsWith(MDX_EXT) || name.endsWith(DOC_EXT);
}

export function stripContentExt(name: string): string {
  if (name.endsWith(DOC_EXT)) return name.slice(0, -DOC_EXT.length);
  if (name.endsWith(MDX_EXT)) return name.slice(0, -MDX_EXT.length);
  return name;
}

/** Имя папки в slug: подчёркивание табовой папки убирается */
export function dirSlugName(diskName: string): string {
  return diskName.startsWith(TAB_DIR_PREFIX)
    ? diskName.slice(TAB_DIR_PREFIX.length)
    : diskName;
}

export interface ContentFile {
  kind: "mdx" | "doc";
  filePath: string;
  /** Дисковый путь без расширения относительно contentDir - для importContent/importDoc */
  importPath: string;
}

/**
 * Находит файл документа по slug-пути. Сегменты-папки могут лежать на диске
 * как есть или с префиксом _ (табовый документ) - в slug префикс не входит.
 */
export function resolveContentFile(
  contentDir: string,
  slugPath: string,
): ContentFile | undefined {
  const segments = slugPath.split("/");
  const fileName = segments.pop()!;

  let dir = contentDir;
  const diskSegments: string[] = [];
  for (const segment of segments) {
    const plain = join(dir, segment);
    const tabbed = join(dir, `${TAB_DIR_PREFIX}${segment}`);
    const hasPlain = existsSync(plain);
    const hasTabbed = existsSync(tabbed);
    if (hasPlain && hasTabbed) {
      throw new Error(
        `tulldoc: для "${segment}" есть и папка-группа, и табовая папка ${TAB_DIR_PREFIX}${segment} - оставьте одну`,
      );
    }
    if (!hasPlain && !hasTabbed) return undefined;
    const diskName = hasPlain ? segment : `${TAB_DIR_PREFIX}${segment}`;
    dir = join(dir, diskName);
    diskSegments.push(diskName);
  }

  const mdxPath = join(dir, `${fileName}${MDX_EXT}`);
  const docPath = join(dir, `${fileName}${DOC_EXT}`);
  const hasMdx = existsSync(mdxPath);
  const hasDoc = existsSync(docPath);
  if (hasMdx && hasDoc) {
    throw new Error(
      `tulldoc: для "${slugPath}" есть и ${MDX_EXT}, и ${DOC_EXT} - оставьте один из файлов`,
    );
  }
  if (!hasMdx && !hasDoc) return undefined;
  const importPath = [...diskSegments, fileName].join("/");
  return hasDoc
    ? { kind: "doc", filePath: docPath, importPath }
    : { kind: "mdx", filePath: mdxPath, importPath };
}

/** Все slug-пути контента - параметры generateStaticParams */
export function collectContentPaths(
  dir: string,
  prefix: string[] = [],
): { slug: string[] }[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const result: { slug: string[] }[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    if (entry.isDirectory()) {
      result.push(
        ...collectContentPaths(join(dir, entry.name), [
          ...prefix,
          dirSlugName(entry.name),
        ]),
      );
    } else if (isContentFile(entry.name)) {
      const name = stripContentExt(entry.name);
      if (seen.has(name)) continue;
      seen.add(name);
      result.push({ slug: [...prefix, name] });
    }
  }
  return result;
}
