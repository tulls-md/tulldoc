import type { HeaderItem } from "../../shared/types";
import type { RepoProvider } from "../../shared/repo";
import { HeaderLink } from "./header-link";
import { HeaderDropdown } from "./header-dropdown";
import { SectionSwitcher, type SectionTab } from "./section-switcher";
import { RepoIcon } from "./repo-icon";
import { MenuButton } from "../mobile-nav/mobile-nav";
import styles from "./header.module.css";

interface HeaderProps {
  items: HeaderItem[];
  /** Ссылка на первую страницу сайдбара - показывается первым пунктом */
  docsLink?: { href: string; label: string };
  /** Переключатель разделов; рендерится вместо docsLink, когда разделов больше одного */
  sections?: SectionTab[];
  /** Есть ли страницы сайдбара - от этого зависит показ бургера на мобиле */
  hasSidebar?: boolean;
  /** Ссылка-иконка на репозиторий в правом углу */
  repo?: { href: string; provider: RepoProvider };
}

export function Header({
  items,
  docsLink,
  sections,
  hasSidebar,
  repo,
}: HeaderProps) {
  const headerSlugs = items
    .filter((item) => !item.external)
    .map((item) => item.slug);
  const showSwitcher = sections && sections.length > 1;
  return (
    <header className={styles.Root}>
      {hasSidebar && <MenuButton headerSlugs={headerSlugs} />}
      <nav className={styles.Nav}>
        {showSwitcher ? (
          <SectionSwitcher sections={sections} />
        ) : (
          docsLink && (
            <HeaderLink
              href={docsLink.href}
              label={docsLink.label}
              excludePaths={headerSlugs.map((slug) => `/${slug}`)}
            />
          )
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
      {repo && (
        <a
          href={repo.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.RepoLink}
          aria-label={repo.provider === "gitlab" ? "GitLab" : "GitHub"}
        >
          <RepoIcon provider={repo.provider} />
        </a>
      )}
    </header>
  );
}
