import type { ReactNode } from "react";
import clsx from "clsx";
import { Code, NotePencil } from "@phosphor-icons/react/ssr";
import { TableOfContents } from "../toc/toc";
import { DocTabs } from "../doc-tabs/doc-tabs";
import { DocPagination } from "../doc-pagination/doc-pagination";
import type {
  PaginationLink,
  SourceLink,
  TocHeading,
} from "../../shared/types";
import styles from "./doc-page.module.css";
import proseStyles from "./prose.module.css";

interface DocPageProps {
  children: ReactNode;
  headings: TocHeading[];
  tabs?: { label: string; slug: string }[];
  activeTab?: string;
  docSlug?: string;
  prev?: PaginationLink;
  next?: PaginationLink;
  tocTitle?: string;
  /** Ссылки на исходники над заголовком: страница и/или компонент */
  sourceLinks?: SourceLink[];
}

export function DocPage({
  children,
  headings,
  tabs,
  activeTab,
  docSlug,
  prev,
  next,
  tocTitle,
  sourceLinks,
}: DocPageProps) {
  return (
    <div className={styles.Root}>
      <article className={clsx(proseStyles.Prose, styles.Content)}>
        {tabs && activeTab && docSlug && (
          <DocTabs tabs={tabs} activeTab={activeTab} docSlug={docSlug} />
        )}
        {sourceLinks && sourceLinks.length > 0 && (
          <div className={styles.SourceLinks}>
            {sourceLinks.map((link) => (
              <a
                key={link.kind}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.SourceLink}
              >
                {link.kind === "edit" ? (
                  <NotePencil size={14} weight="bold" />
                ) : (
                  <Code size={14} weight="bold" />
                )}
                {link.label}
              </a>
            ))}
          </div>
        )}
        {children}
        <DocPagination prev={prev} next={next} />
      </article>
      <TableOfContents headings={headings} title={tocTitle} />
    </div>
  );
}
