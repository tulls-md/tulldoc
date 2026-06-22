"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import styles from "./header.module.css";

interface LangSwitcherProps {
  locales: string[];
  current: string;
}

/** Меняет первый сегмент пути (локаль) на выбранный, сохраняя остальной путь */
function swapLocale(pathname: string, locale: string): string {
  const segments = pathname.split("/");
  // segments[0] - пустая строка до первого "/", segments[1] - текущая локаль
  if (segments.length < 2) return `/${locale}`;
  segments[1] = locale;
  return segments.join("/");
}

export function LangSwitcher({ locales, current }: LangSwitcherProps) {
  const pathname = usePathname();
  return (
    <div className={styles.LangSwitcher}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={swapLocale(pathname, locale)}
          aria-current={locale === current ? "true" : undefined}
          className={clsx(
            styles.LangLink,
            locale === current && styles.LangLinkActive,
          )}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
