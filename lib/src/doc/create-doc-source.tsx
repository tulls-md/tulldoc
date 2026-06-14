import { readFileSync } from "fs";
import type { ComponentType, ReactNode } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import matter from "gray-matter";
import { DocLayout } from "../components/doc-layout/doc-layout";
import { DocPage } from "../components/doc-page/doc-page";
import {
  collectContentPaths,
  resolveContentFile,
} from "../content/content-files";
import {
  getNavigation,
  itemHref,
  resolveDocTabs,
  resolvePagination,
} from "../content/nav-items";
import { extractHeadings } from "../shared/extract-headings";
import { getDocStrings } from "../shared/strings";
import type { TulldocPlugin } from "./plugin";

interface DocSourceOptions {
  contentDir: string;
  /** Импорт .mdx-файлов; обязателен, если в contentDir есть .mdx-файлы */
  importContent?: (path: string) => Promise<{ default: ComponentType }>;
  /**
   * Плагины-расширения. Документирование компонентов (.doc.tsx) добавляет
   * componentDocs() из @tulls-md/tulldoc-code.
   */
  plugins?: TulldocPlugin[];
  lang?: string;
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export function createDocSource({
  contentDir,
  importContent,
  plugins,
  lang,
}: DocSourceOptions) {
  function requireDocPlugin(filePath: string): TulldocPlugin {
    const plugin = plugins?.[0];
    if (!plugin) {
      throw new Error(
        `tulldoc: найден ${filePath}, но ни один плагин не подключён. Установите @tulls-md/tulldoc-code и добавьте componentDocs({ importDoc, componentsDir }) в plugins createDocSource`,
      );
    }
    return plugin;
  }

  async function generateStaticParams() {
    return collectContentPaths(contentDir);
  }

  async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const file = resolveContentFile(contentDir, slug.join("/"));
    if (!file) return {};
    let docTitle: string | undefined;
    let description: string | undefined;
    if (file.kind === "doc") {
      const meta = plugins?.[0]?.getMetadata(file.filePath);
      docTitle = meta?.title;
      description = meta?.description;
    } else {
      const { data } = matter(readFileSync(file.filePath, "utf-8"));
      docTitle = data.title;
      description = data.description;
    }
    const { allItems } = getNavigation(contentDir, plugins);
    const { docSlug } = resolveDocTabs(allItems, slug);
    const item = allItems.find((i) => i.slug === docSlug);
    const title =
      item && docTitle
        ? `${item.label} - ${docTitle}`
        : (docTitle ?? item?.label);
    return { title, description };
  }

  async function Page({ params }: PageProps) {
    const { slug } = await params;
    const slugPath = slug.join("/");
    const file = resolveContentFile(contentDir, slugPath);
    if (!file) notFound();

    const { sidebarItems, allItems } = getNavigation(contentDir, plugins);
    const { tabs, activeTab, docSlug } = resolveDocTabs(allItems, slug);
    const { prev, next } = resolvePagination(sidebarItems, slugPath);
    const strings = getDocStrings(lang);

    if (file.kind === "doc") {
      const plugin = requireDocPlugin(file.filePath);
      const { headings, content } = await plugin.renderDoc({ file, strings });
      return (
        <DocPage
          headings={headings}
          tabs={tabs}
          activeTab={activeTab}
          docSlug={docSlug}
          prev={prev}
          next={next}
          tocTitle={strings.onThisPage}
        >
          {content}
        </DocPage>
      );
    }

    if (!importContent) {
      throw new Error(
        `tulldoc: найден ${file.filePath}, но importContent не задан в createDocSource`,
      );
    }
    const { content } = matter(readFileSync(file.filePath, "utf-8"));
    const { default: Content } = await importContent(file.importPath);

    return (
      <DocPage
        headings={extractHeadings(content)}
        tabs={tabs}
        activeTab={activeTab}
        docSlug={docSlug}
        prev={prev}
        next={next}
        tocTitle={strings.onThisPage}
      >
        <Content />
      </DocPage>
    );
  }

  function Layout({ children }: { children: ReactNode }) {
    return (
      <DocLayout contentDir={contentDir} lang={lang} plugins={plugins}>
        {children}
      </DocLayout>
    );
  }

  function IndexPage() {
    const { sidebarItems } = getNavigation(contentDir, plugins);
    const first = sidebarItems.find((item) => !item.external);
    if (!first) notFound();
    redirect(itemHref(first));
  }

  return { generateStaticParams, generateMetadata, Page, Layout, IndexPage };
}
