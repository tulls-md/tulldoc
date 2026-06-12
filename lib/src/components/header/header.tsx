import type { HeaderItem } from "../../shared/types";
import { HeaderLink } from "./header-link";
import { HeaderDropdown } from "./header-dropdown";
import styles from "./header.module.css";

interface HeaderProps {
  items: HeaderItem[];
  /** Ссылка на первую страницу сайдбара - показывается первым пунктом */
  docsLink?: { href: string; label: string };
}

export function Header({ items, docsLink }: HeaderProps) {
  return (
    <header className={styles.Root}>
      <nav className={styles.Nav}>
        {docsLink && (
          <HeaderLink
            href={docsLink.href}
            label={docsLink.label}
            excludePaths={items
              .filter((item) => !item.external)
              .map((item) => `/${item.slug}`)}
          />
        )}
        {items.map((item) =>
          item.external ? (
            <a
              key={item.slug}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.Link}
            >
              {item.label}
              <span className={styles.ExternalIcon} aria-hidden>
                ↗
              </span>
            </a>
          ) : item.items ? (
            <HeaderDropdown
              key={item.slug}
              label={item.label}
              items={item.items}
              basePath={`/${item.slug}`}
            />
          ) : (
            <HeaderLink
              key={item.slug}
              href={item.href!}
              label={item.label}
              basePath={`/${item.slug}`}
            />
          ),
        )}
      </nav>
    </header>
  );
}
