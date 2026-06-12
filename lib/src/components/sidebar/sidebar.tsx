import type { NavItem } from "../../shared/types";
import styles from "./sidebar.module.css";
import { SidebarLink } from "./sidebar-link";

interface SidebarProps {
  items: NavItem[];
}

function renderItem({ slug, label, tabs, external, href }: NavItem) {
  return (
    <li key={slug}>
      <SidebarLink
        href={external ? href! : tabs ? `/${slug}/${tabs[0].slug}` : `/${slug}`}
        label={label}
        activeBasePath={tabs ? `/${slug}` : undefined}
        external={external}
      />
    </li>
  );
}

export function Sidebar({ items }: SidebarProps) {
  const ungrouped = items.filter((i) => i.group === null);
  const groups = items
    .filter((i) => i.group !== null)
    .reduce<Record<string, NavItem[]>>((acc, item) => {
      const key = item.group!;
      acc[key] = [...(acc[key] ?? []), item];
      return acc;
    }, {});

  return (
    <aside className={styles.Root}>
      <nav>
        {ungrouped.length > 0 && (
          <ul className={styles.List}>{ungrouped.map(renderItem)}</ul>
        )}
        {Object.entries(groups).map(([group, groupItems]) => (
          <div key={group} className={styles.Group}>
            <span className={styles.GroupLabel}>{group}</span>
            <ul className={styles.List}>{groupItems.map(renderItem)}</ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
