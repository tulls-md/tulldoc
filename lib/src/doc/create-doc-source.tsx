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
import { buildSourceUrl, findGitRoot, type RepoConfig } from "../shared/repo";
import type { SourceLink } from "../shared/types";
import type { TulldocPlugin } from "./plugin";

interface DocSourceOptions {
  contentDir: string;
  importContent?: (path: string) => Promise<{ default: ComponentType }>;
  plugins?: TulldocPlugin[];
  lang?: string;
  repo?: RepoConfig;
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export function createDocSource({
  contentDir,
  importContent,
  plugins,
  lang,
  repo,
}: DocSourceOptions) {
  function sourceHref(filePath: string): string | undefined {
    if (!repo) return undefined;
    return buildSourceUrl(repo, filePath, findGitRoot(contentDir));
  }

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

    const { sections, allItems } = getNavigation(contentDir, plugins);
    const { tabs, activeTab, docSlug } = resolveDocTabs(allItems, slug);
    // Пагинация в пределах активного раздела (определяем по первому сегменту slug)
    const activeSection =
      sections.find((section) => section.slug === slug[0]) ??
      sections.find((section) => section.slug === null)!;
    const { prev, next } = resolvePagination(activeSection.sidebarItems, slugPath);
    const strings = getDocStrings(lang);

    const editHref = sourceHref(file.filePath);
    const editLink: SourceLink[] = editHref
      ? [{ href: editHref, label: strings.editPage, kind: "edit" }]
      : [];

    if (file.kind === "doc") {
      const plugin = requireDocPlugin(file.filePath);
      const {
        headings,
        content,
        sourceHref: componentHref,
      } = await plugin.renderDoc({ file, strings, sourceUrl: sourceHref });
      const sourceLinks: SourceLink[] = [...editLink];
      if (componentHref) {
        sourceLinks.push({
          href: componentHref,
          label: strings.componentSource,
          kind: "component",
        });
      }
      return (
        <DocPage
          headings={headings}
          tabs={tabs}
          activeTab={activeTab}
          docSlug={docSlug}
          prev={prev}
          next={next}
          tocTitle={strings.onThisPage}
          sourceLinks={sourceLinks}
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
        sourceLinks={editLink}
      >
        <Content />
      </DocPage>
    );
  }

  function Layout({ children }: { children: ReactNode }) {
    return (
      <DocLayout
        contentDir={contentDir}
        lang={lang}
        plugins={plugins}
        repo={repo}
      >
        {children}
      </DocLayout>
    );
  }

  function IndexPage() {
    const { sections } = getNavigation(contentDir, plugins);
    const first = sections
      .flatMap((section) => section.sidebarItems)
      .find((item) => !item.external);
    if (!first) notFound();
    redirect(itemHref(first));
  }

  return { generateStaticParams, generateMetadata, Page, Layout, IndexPage };
}
