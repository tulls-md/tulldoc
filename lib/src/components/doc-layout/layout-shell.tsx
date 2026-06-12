"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import styles from "./doc-layout.module.css";

interface LayoutShellProps {
  children: ReactNode;
  /** Сайдбар как готовый узел - серверный рендер списка сохраняется */
  sidebar: ReactNode;
  /** Slug'и верхнего уровня страниц шапки - на них сайдбар скрыт */
  headerSlugs: string[];
}

export function LayoutShell({
  children,
  sidebar,
  headerSlugs,
}: LayoutShellProps) {
  const pathname = usePathname();
  const isHeaderPage = headerSlugs.some(
    (slug) => pathname === `/${slug}` || pathname.startsWith(`/${slug}/`),
  );

  return (
    <div className={styles.Content}>
      {!isHeaderPage && sidebar}
      <main className={styles.Main}>{children}</main>
    </div>
  );
}
