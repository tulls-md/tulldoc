"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import styles from "./header.module.css";

export interface SectionTab {
  /** URL-сегмент раздела; null у раздела по умолчанию */
  slug: string | null;
  label: string;
  /** Ссылка на первую страницу раздела */
  href: string;
}

interface SectionSwitcherProps {
  sections: SectionTab[];
}

function isUnder(pathname: string, slug: string): boolean {
  return pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
}

export function SectionSwitcher({ sections }: SectionSwitcherProps) {
  const pathname = usePathname();
  const otherSlugs = sections
    .map((section) => section.slug)
    .filter((slug): slug is string => slug !== null);

  return (
    <>
      {sections.map((section) => {
        const isActive =
          section.slug !== null
            ? isUnder(pathname, section.slug)
            : // Раздел по умолчанию активен, если путь не под другим разделом
              !otherSlugs.some((slug) => isUnder(pathname, slug));
        return (
          <Link
            key={section.slug ?? ""}
            href={section.href}
            className={clsx(styles.Link, isActive && styles.LinkActive)}
          >
            {section.label}
          </Link>
        );
      })}
    </>
  );
}
