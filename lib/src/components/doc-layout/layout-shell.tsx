"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useMobileNav } from "../mobile-nav/mobile-nav";
import styles from "./doc-layout.module.css";

interface LayoutShellProps {
  children: ReactNode;
  /**
   * Сайдбары всех разделов как готовые узлы - серверный рендер списков сохраняется.
   * Активный выбирается на клиенте по pathname (slug: null - раздел по умолчанию).
   * Для типичной документации это несколько небольших списков - дешевле, чем
   * перерендер серверного layout на каждый переход.
   */
  sidebars: { slug: string | null; node: ReactNode }[];
  /** Slug'и верхнего уровня страниц шапки - на них сайдбар скрыт */
  headerSlugs: string[];
}

export function LayoutShell({
  children,
  sidebars,
  headerSlugs,
}: LayoutShellProps) {
  const pathname = usePathname();
  const { open, close } = useMobileNav();
  const isUnder = (slug: string) =>
    pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  const isHeaderPage = headerSlugs.some(isUnder);
  const activeSidebar =
    sidebars.find((s) => s.slug !== null && isUnder(s.slug)) ??
    sidebars.find((s) => s.slug === null);

  return (
    <div className={styles.Content}>
      {!isHeaderPage && activeSidebar && (
        <>
          <div
            id="tulldoc-sidebar"
            className={clsx(styles.SidebarSlot, open && styles.SidebarSlotOpen)}
          >
            {activeSidebar.node}
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
