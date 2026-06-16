"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useMobileNav } from "../mobile-nav/mobile-nav";
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
  const { open, close } = useMobileNav();
  const isHeaderPage = headerSlugs.some(
    (slug) => pathname === `/${slug}` || pathname.startsWith(`/${slug}/`),
  );

  return (
    <div className={styles.Content}>
      {!isHeaderPage && (
        <>
          <div
            id="tulldoc-sidebar"
            className={clsx(styles.SidebarSlot, open && styles.SidebarSlotOpen)}
          >
            {sidebar}
          </div>
          {open && (
            <div className={styles.Backdrop} onClick={close} aria-hidden />
          )}
        </>
      )}
      <main className={styles.Main}>{children}</main>
    </div>
  );
}
