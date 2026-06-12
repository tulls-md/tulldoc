import Link from "next/link";
import clsx from "clsx";
import styles from "./doc-tabs.module.css";

interface Tab {
  label: string;
  slug: string;
}

interface DocTabsProps {
  tabs: Tab[];
  activeTab: string;
  docSlug: string;
}

export function DocTabs({ tabs, activeTab, docSlug }: DocTabsProps) {
  return (
    <nav className={styles.Root}>
      {tabs.map(({ label, slug }) => (
        <Link
          key={slug}
          href={`/${docSlug}/${slug}`}
          className={clsx(styles.Tab, slug === activeTab && styles.TabActive)}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
