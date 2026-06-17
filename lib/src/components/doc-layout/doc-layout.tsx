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
  const { sidebarItems, headerItems } = getNavigation(contentDir, plugins);
  const firstDoc = sidebarItems.find((item) => !item.external);
  // Шапку показываем, если есть её пункты или сайдбар - на мобиле в ней живёт бургер
  const showHeader = headerItems.length > 0 || sidebarItems.length > 0;

  return (
    <html lang={lang}>
      <body className={styles.Body}>
        <MobileNavProvider>
          {showHeader && (
            <Header
              items={headerItems}
              hasSidebar={sidebarItems.length > 0}
              docsLink={
                firstDoc
                  ? {
                      href: itemHref(firstDoc),
                      label: getDocStrings(lang).documentation,
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
            sidebar={<Sidebar items={sidebarItems} />}
          >
            {children}
          </LayoutShell>
        </MobileNavProvider>
      </body>
    </html>
  );
}
