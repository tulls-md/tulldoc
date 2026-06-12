import type { ReactNode } from "react";
import clsx from "clsx";
import { TableOfContents } from "../toc/toc";
import { DocTabs } from "../doc-tabs/doc-tabs";
import { DocPagination } from "../doc-pagination/doc-pagination";
import type { PaginationLink, TocHeading } from "../../shared/types";
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
}: DocPageProps) {
  return (
    <div className={styles.Root}>
      <article className={clsx(proseStyles.Prose, styles.Content)}>
        {tabs && activeTab && docSlug && (
          <DocTabs tabs={tabs} activeTab={activeTab} docSlug={docSlug} />
        )}
        {children}
        <DocPagination prev={prev} next={next} />
      </article>
      <TableOfContents headings={headings} title={tocTitle} />
    </div>
  );
}
