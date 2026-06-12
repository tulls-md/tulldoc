import type { ReactNode } from "react";
import { Header } from "../header/header";
import { Sidebar } from "../sidebar/sidebar";
import { getNavigation, itemHref } from "../../content/nav-items";
import { getDocStrings } from "../../shared/strings";
import { LayoutShell } from "./layout-shell";
import styles from "./doc-layout.module.css";

interface DocLayoutProps {
  children: ReactNode;
  contentDir: string;
  lang?: string;
}

export function DocLayout({
  children,
  contentDir,
  lang = "en",
}: DocLayoutProps) {
  const { sidebarItems, headerItems } = getNavigation(contentDir);
  const firstDoc = sidebarItems.find((item) => !item.external);

  return (
    <html lang={lang}>
      <body className={styles.Body}>
        {headerItems.length > 0 && (
          <Header
            items={headerItems}
            docsLink={
              firstDoc
                ? {
                    href: itemHref(firstDoc),
                    label: getDocStrings(lang).documentation,
                  }
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
      </body>
    </html>
  );
}
