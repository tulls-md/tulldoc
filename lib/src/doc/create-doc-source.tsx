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
import { buildDocModel } from "./build-model";
import { DocContent } from "./doc-content";
import type { DocMeta } from "./doc-meta";
import { extractDocStrings } from "./static-info";

interface DocSourceOptions {
  contentDir: string;
  /** Импорт .mdx-файлов; обязателен, если в contentDir есть .mdx-файлы */
  importContent?: (path: string) => Promise<{ default: ComponentType }>;
  /** Импорт .doc.tsx-документов; обязателен, если в contentDir есть такие файлы */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- документ описывает компонент с произвольными пропсами
  importDoc?: (
    path: string,
  ) => Promise<{ default: () => DocMeta<ComponentType<any>> }>;
  /** Корень исходников UI-компонентов - для секций API и автопримеров .doc.tsx */
  componentsDir?: string;
  /** Корень примеров - для кода ручных примеров .doc.tsx */
  examplesDir?: string;
  lang?: string;
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export function createDocSource({
  contentDir,
  importContent,
  importDoc,
  componentsDir,
  examplesDir,
  lang,
}: DocSourceOptions) {
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
      const info = extractDocStrings(file.filePath);
      docTitle = info.title ?? info.componentName;
      description = info.description;
    } else {
      const { data } = matter(readFileSync(file.filePath, "utf-8"));
      docTitle = data.title;
      description = data.description;
    }
    const { allItems } = getNavigation(contentDir);
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

    const { sidebarItems, allItems } = getNavigation(contentDir);
    const { tabs, activeTab, docSlug } = resolveDocTabs(allItems, slug);
    const { prev, next } = resolvePagination(sidebarItems, slugPath);
    const strings = getDocStrings(lang);

    if (file.kind === "doc") {
      if (!importDoc) {
        throw new Error(
          `tulldoc: найден ${file.filePath}, но importDoc не задан в createDocSource`,
        );
      }
      const { default: docFn } = await importDoc(file.importPath);
      if (typeof docFn !== "function") {
        throw new Error(
          `tulldoc: ${file.filePath} должен иметь default-экспорт функции, возвращающей DocMeta (сейчас default - ${typeof docFn})`,
        );
      }
      const meta = docFn();
      const staticInfo = extractDocStrings(file.filePath);
      const model = buildDocModel({ meta, strings, componentsDir, staticInfo });
      return (
        <DocPage
          headings={model.headings}
          tabs={tabs}
          activeTab={activeTab}
          docSlug={docSlug}
          prev={prev}
          next={next}
          tocTitle={strings.onThisPage}
        >
          <DocContent
            meta={meta}
            model={model}
            strings={strings}
            examplesDir={examplesDir}
          />
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
      <DocLayout contentDir={contentDir} lang={lang}>
        {children}
      </DocLayout>
    );
  }

  function IndexPage() {
    const { sidebarItems } = getNavigation(contentDir);
    const first = sidebarItems.find((item) => !item.external);
    if (!first) notFound();
    redirect(itemHref(first));
  }

  return { generateStaticParams, generateMetadata, Page, Layout, IndexPage };
}
