import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { cache } from "react";
import matter from "gray-matter";
import type { HeaderItem, NavItem, PaginationLink } from "../shared/types";
import {
  DOC_EXT,
  TAB_DIR_PREFIX,
  dirSlugName,
  isContentFile,
  resolveContentFile,
  stripContentExt,
} from "./content-files";
import type { TulldocPlugin } from "../doc/plugin";

/** Внешняя ссылка в pages/header meta.json */
interface LinkEntry {
  label: string;
  href: string;
}

/** Имя файла/папки или внешняя ссылка */
type MetaEntry = string | LinkEntry;

interface DirMeta {
  title?: string;
  pages?: MetaEntry[];
  /** Имена файлов/папок для шапки сайта; учитывается только в корневом meta.json */
  header?: MetaEntry[];
}

function readDirMeta(dir: string): DirMeta {
  const metaPath = join(dir, "meta.json");
  if (!existsSync(metaPath)) return {};
  let meta: DirMeta;
  try {
    meta = JSON.parse(readFileSync(metaPath, "utf-8")) as DirMeta;
  } catch (error) {
    throw new Error(
      `tulldoc: не удалось разобрать ${metaPath}: ${error instanceof Error ? error.message : error}`,
    );
  }
  for (const entry of [...(meta.pages ?? []), ...(meta.header ?? [])]) {
    if (typeof entry !== "string" && !(entry?.label && entry?.href)) {
      throw new Error(
        `tulldoc: внешняя ссылка в ${metaPath} должна содержать label и href`,
      );
    }
  }
  return meta;
}

function readDocTitle(
  filePath: string,
  plugins?: TulldocPlugin[],
): string | null {
  if (filePath.endsWith(DOC_EXT)) {
    for (const plugin of plugins ?? []) {
      const title = plugin.getMetadata(filePath).title;
      if (title) return title;
    }
    return null;
  }
  const { data } = matter(readFileSync(filePath, "utf-8"));
  return typeof data.title === "string" ? data.title : null;
}

function prettify(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function sortByPages<T extends { name: string }>(
  entries: T[],
  pages?: string[],
): T[] {
  return [...entries].sort((a, b) => {
    const ai = pages?.indexOf(a.name) ?? -1;
    const bi = pages?.indexOf(b.name) ?? -1;
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Порядок элементов по pages со вставкой внешних ссылок на их позиции:
 * упомянутые в pages идут первыми в порядке списка, остальные - в конце по алфавиту.
 */
function orderWithLinks<T extends { name: string }>(
  entries: T[],
  pages?: MetaEntry[],
): ({ kind: "fs"; entry: T } | { kind: "link"; link: LinkEntry })[] {
  const result: (
    | { kind: "fs"; entry: T }
    | { kind: "link"; link: LinkEntry }
  )[] = [];
  const used = new Set<T>();
  for (const page of pages ?? []) {
    if (typeof page === "string") {
      for (const entry of entries.filter(
        (e) => e.name === page && !used.has(e),
      )) {
        used.add(entry);
        result.push({ kind: "fs", entry });
      }
    } else {
      result.push({ kind: "link", link: page });
    }
  }
  const rest = entries
    .filter((e) => !used.has(e))
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...result, ...rest.map((entry) => ({ kind: "fs" as const, entry }))];
}

function stringPages(meta: DirMeta, dir: string): string[] | undefined {
  if (meta.pages?.some((p) => typeof p !== "string")) {
    throw new Error(
      `tulldoc: табовая папка ${dir} не поддерживает внешние ссылки в pages`,
    );
  }
  return meta.pages as string[] | undefined;
}

function createTabbedItem(
  dir: string,
  name: string,
  slugPath: string,
  group: string | null,
  plugins?: TulldocPlugin[],
): NavItem {
  if (readdirSync(dir, { withFileTypes: true }).some((e) => e.isDirectory())) {
    throw new Error(
      `tulldoc: табовая папка ${dir} не может содержать подпапки`,
    );
  }
  const meta = readDirMeta(dir);
  const files = [
    ...new Set(readdirSync(dir).filter(isContentFile).map(stripContentExt)),
  ].map((f) => ({ name: f }));

  const tabs = sortByPages(files, stringPages(meta, dir)).map(
    ({ name: tabSlug }) => {
      const file = resolveContentFile(dir, tabSlug)!;
      return {
        slug: tabSlug,
        label: readDocTitle(file.filePath, plugins) ?? prettify(tabSlug),
      };
    },
  );

  return { slug: slugPath, group, label: meta.title ?? prettify(name), tabs };
}

function scanDir(
  dir: string,
  prefixParts: string[],
  group: string | null,
  exclude?: Set<string>,
  plugins?: TulldocPlugin[],
): NavItem[] {
  const meta = readDirMeta(dir);
  const entries = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() || isContentFile(e.name))
    .map((e) => ({
      name: e.isDirectory() ? dirSlugName(e.name) : stripContentExt(e.name),
      diskName: e.name,
      isDirectory: e.isDirectory(),
    }));

  const results: NavItem[] = [];
  const seen = new Set<string>();
  for (const ordered of orderWithLinks(entries, meta.pages)) {
    if (ordered.kind === "link") {
      const { label, href } = ordered.link;
      results.push({ slug: href, group, label, href, external: true });
      continue;
    }
    const { name, diskName, isDirectory } = ordered.entry;
    if (exclude?.has(name)) continue;
    if (!isDirectory && seen.has(name)) continue;
    if (!isDirectory) seen.add(name);
    const slugPath = [...prefixParts, name].join("/");
    if (isDirectory) {
      const subDir = join(dir, diskName);
      if (diskName.startsWith(TAB_DIR_PREFIX)) {
        results.push(createTabbedItem(subDir, name, slugPath, group, plugins));
      } else {
        const groupTitle = readDirMeta(subDir).title ?? prettify(name);
        results.push(
          ...scanDir(
            subDir,
            [...prefixParts, name],
            groupTitle,
            undefined,
            plugins,
          ),
        );
      }
    } else {
      // resolveContentFile бросит ошибку при коллизии name.mdx + name.doc.tsx
      const file = resolveContentFile(dir, name)!;
      const label = readDocTitle(file.filePath, plugins) ?? prettify(name);
      results.push({ slug: slugPath, group, label });
    }
  }
  return results;
}

export interface Navigation {
  /** Пункты бокового меню - всё, кроме помеченного в header */
  sidebarItems: NavItem[];
  /** Пункты шапки сайта - из списка header корневого meta.json */
  headerItems: HeaderItem[];
  /** Сайдбар + контент шапки - для resolveDocTabs и метаданных */
  allItems: NavItem[];
}

export const getNavigation = cache(
  (contentDir: string, plugins?: TulldocPlugin[]): Navigation => {
    const headerEntries = readDirMeta(contentDir).header ?? [];
    const headerNames = headerEntries.filter(
      (e): e is string => typeof e === "string",
    );
    const sidebarItems = scanDir(
      contentDir,
      [],
      null,
      new Set(headerNames),
      plugins,
    );

    const headerItems: HeaderItem[] = [];
    const headerNavItems: NavItem[] = [];
    for (const entry of headerEntries) {
      if (typeof entry !== "string") {
        headerItems.push({
          slug: entry.href,
          label: entry.label,
          href: entry.href,
          external: true,
        });
        continue;
      }
      const name = entry;
      const tabbedDir = join(contentDir, `${TAB_DIR_PREFIX}${name}`);
      const plainDir = join(contentDir, name);
      if (existsSync(tabbedDir)) {
        const item = createTabbedItem(tabbedDir, name, name, null, plugins);
        headerNavItems.push(item);
        headerItems.push({
          slug: name,
          label: item.label,
          href: itemHref(item),
        });
      } else if (existsSync(plainDir)) {
        const label = readDirMeta(plainDir).title ?? prettify(name);
        const children = scanDir(plainDir, [name], label, undefined, plugins);
        headerNavItems.push(...children.filter((child) => !child.external));
        headerItems.push({
          slug: name,
          label,
          items: children.map((child) => ({
            href: itemHref(child),
            label: child.label,
            external: child.external,
          })),
        });
      } else {
        const file = resolveContentFile(contentDir, name);
        if (!file) {
          throw new Error(
            `tulldoc: в meta.json указан header-пункт "${name}", но файла или папки с таким именем нет`,
          );
        }
        const label = readDocTitle(file.filePath, plugins) ?? prettify(name);
        headerNavItems.push({ slug: name, group: null, label });
        headerItems.push({ slug: name, label, href: `/${name}` });
      }
    }

    return {
      sidebarItems,
      headerItems,
      allItems: [...sidebarItems, ...headerNavItems],
    };
  },
);

export function getNavItems(
  contentDir: string,
  plugins?: TulldocPlugin[],
): NavItem[] {
  return getNavigation(contentDir, plugins).sidebarItems;
}

export function itemHref(item: NavItem): string {
  if (item.external) return item.href!;
  return item.tabs?.length
    ? `/${item.slug}/${item.tabs[0].slug}`
    : `/${item.slug}`;
}

/** Табы документа, если последний сегмент slug - таб табовой папки */
export function resolveDocTabs(navItems: NavItem[], slug: string[]) {
  if (slug.length < 2) {
    return { tabs: undefined, activeTab: undefined, docSlug: undefined };
  }
  const parentPath = slug.slice(0, -1).join("/");
  const activeTab = slug[slug.length - 1];
  const tabbedItem = navItems.find(
    (item) => item.slug === parentPath && item.tabs !== undefined,
  );
  if (tabbedItem) {
    return { tabs: tabbedItem.tabs, activeTab, docSlug: parentPath };
  }
  return { tabs: undefined, activeTab: undefined, docSlug: undefined };
}

function flattenPages(navItems: NavItem[]): PaginationLink[] {
  return navItems
    .filter((item) => !item.external)
    .flatMap((item) =>
      item.tabs?.length
        ? item.tabs.map((tab) => ({
            href: `/${item.slug}/${tab.slug}`,
            label: `${item.label} - ${tab.label}`,
          }))
        : [{ href: `/${item.slug}`, label: item.label }],
    );
}

export function resolvePagination(
  navItems: NavItem[],
  slugPath: string,
): { prev?: PaginationLink; next?: PaginationLink } {
  const pages = flattenPages(navItems);
  const index = pages.findIndex((page) => page.href === `/${slugPath}`);
  if (index === -1) return {};
  return { prev: pages[index - 1], next: pages[index + 1] };
}
