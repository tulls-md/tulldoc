import Link from "next/link";
import clsx from "clsx";
import type { PaginationLink } from "../../shared/types";
import styles from "./doc-pagination.module.css";

interface DocPaginationProps {
  prev?: PaginationLink;
  next?: PaginationLink;
}

export function DocPagination({ prev, next }: DocPaginationProps) {
  if (!prev && !next) return null;
  return (
    <nav className={styles.Root}>
      {prev && (
        <Link href={prev.href} className={styles.Link}>
          <span aria-hidden>←</span>
          {prev.label}
        </Link>
      )}
      {next && (
        <Link href={next.href} className={clsx(styles.Link, styles.Next)}>
          {next.label}
          <span aria-hidden>→</span>
        </Link>
      )}
    </nav>
  );
}
