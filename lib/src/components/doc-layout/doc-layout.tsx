import type { ReactNode } from "react";
import { Header } from "../header/header";
import { Sidebar } from "../sidebar/sidebar";
import { getNavigation, itemHref } from "../../content/nav-items";
import { getDocStrings } from "../../shared/strings";
import { resolveProvider, type RepoConfig } from "../../shared/repo";
import type { TulldocPlugin } from "../../doc/plugin";
import { LayoutShell } from "./layout-shell";
import { MobileNavProvider } from "../mobile-nav/mobile-nav";
import styles from "./doc-layout.module.css";

interface DocLayoutProps {
  children: ReactNode;
  contentDir: string;
  lang?: string;
  plugins?: TulldocPlugin[];
  repo?: RepoConfig;
}

export function DocLayout({
  children,
  contentDir,
  lang = "en",
  plugins,
  repo,
}: DocLayoutProps) {
  const { sidebarItems, sections, headerItems } = getNavigation(
    contentDir,
    plugins,
    lang,
  );
  const firstDoc = sidebarItems.find((item) => !item.external);
  const hasSidebar = sections.some((section) =>
    section.sidebarItems.some((item) => !item.external),
  );
  // Шапку показываем, если есть её пункты или сайдбар - на мобиле в ней живёт бургер
  const showHeader = headerItems.length > 0 || hasSidebar;

  // Вкладки переключателя: ссылка на первую страницу раздела
  const sectionTabs = sections
    .map((section) => {
      const first = section.sidebarItems.find((item) => !item.external);
      return first
        ? { slug: section.slug, label: section.label, href: itemHref(first) }
        : null;
    })
    .filter((tab): tab is NonNullable<typeof tab> => tab !== null);

  return (
    <html lang={lang}>
      <body className={styles.Body}>
        <MobileNavProvider>
          {showHeader && (
            <Header
              items={headerItems}
              hasSidebar={hasSidebar}
              sections={sectionTabs}
              docsLink={
                firstDoc
                  ? {
                      href: itemHref(firstDoc),
                      // Подпись раздела по умолчанию: title корневого meta.json или "Документация"
                      label: sections[0]?.label ?? getDocStrings(lang).documentation,
                    }
                  : undefined
              }
              repo={
                repo
                  ? { href: repo.url, provider: resolveProvider(repo) }
                  : undefined
              }
            />
          )}
          <LayoutShell
            headerSlugs={headerItems
              .filter((item) => !item.external)
              .map((item) => item.slug)}
            sidebars={sections.map((section) => ({
              slug: section.slug,
              node: <Sidebar items={section.sidebarItems} lang={lang} />,
            }))}
          >
            {children}
          </LayoutShell>
        </MobileNavProvider>
      </body>
    </html>
  );
}
