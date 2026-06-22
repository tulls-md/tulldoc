import { readFileSync } from "fs";
import matter from "gray-matter";
import { getNavItems, itemHref } from "../../content/nav-items";
import { resolveContentFile } from "../../content/content-files";
import type { NavItem } from "../../shared/types";
import type { TulldocPlugin } from "../../doc/plugin";

/** Узел содержания: страница, табовый документ или внешняя ссылка */
export interface ContentsNode {
  /** Slug документа; у внешней ссылки совпадает с href */
  slug: string;
  /** Готовая ссылка (через itemHref) - учитывает табы и внешние ссылки */
  href: string;
  label: string;
  /** Описание из frontmatter (mdx) или метаданных плагина (doc) */
  description?: string;
  /** Картинка превью из frontmatter `cover` */
  cover?: string;
  external?: boolean;
  /** Табы табового документа как дочерние узлы */
  children?: ContentsNode[];
}

/** Группа содержания - аналог секции сайдбара (по полю group) */
export interface ContentsGroup {
  title: string | null;
  items: ContentsNode[];
}

export interface BuildContentsOptions {
  /** Slug-префикс: ограничивает содержание поддеревом раздела */
  path?: string;
  plugins?: TulldocPlugin[];
}

/** Дочитывает description/cover из файла документа поверх данных навигации */
function readMeta(
  contentDir: string,
  slug: string,
  plugins?: TulldocPlugin[],
): { description?: string; cover?: string } {
  const file = resolveContentFile(contentDir, slug);
  if (!file) return {};
  if (file.kind === "doc") {
    for (const plugin of plugins ?? []) {
      const description = plugin.getMetadata(file.filePath).description;
      if (description) return { description };
    }
    return {};
  }
  const { data } = matter(readFileSync(file.filePath, "utf-8"));
  return {
    description:
      typeof data.description === "string" ? data.description : undefined,
    cover: typeof data.cover === "string" ? data.cover : undefined,
  };
}

function toNode(
  item: NavItem,
  contentDir: string,
  plugins?: TulldocPlugin[],
): ContentsNode {
  if (item.external) {
    return {
      slug: item.slug,
      href: item.href!,
      label: item.label,
      external: true,
    };
  }
  if (item.tabs?.length) {
    return {
      slug: item.slug,
      href: itemHref(item),
      label: item.label,
      children: item.tabs.map((tab) => ({
        slug: `${item.slug}/${tab.slug}`,
        href: `/${item.slug}/${tab.slug}`,
        label: tab.label,
      })),
    };
  }
  const { description, cover } = readMeta(contentDir, item.slug, plugins);
  return { slug: item.slug, href: itemHref(item), label: item.label, description, cover };
}

/**
 * Строит содержание из той же навигации, что и сайдбар (getNavItems),
 * группируя по полю group и дочитывая description/cover из файлов.
 */
export function buildContents(
  contentDir: string,
  { path, plugins }: BuildContentsOptions = {},
): ContentsGroup[] {
  let items = getNavItems(contentDir, plugins);
  if (path) {
    const prefix = `${path}/`;
    items = items.filter((i) => i.slug === path || i.slug.startsWith(prefix));
  }

  const groups: ContentsGroup[] = [];
  const byTitle = new Map<string | null, ContentsGroup>();
  for (const item of items) {
    let group = byTitle.get(item.group);
    if (!group) {
      group = { title: item.group, items: [] };
      byTitle.set(item.group, group);
      groups.push(group);
    }
    group.items.push(toNode(item, contentDir, plugins));
  }
  return groups;
}
