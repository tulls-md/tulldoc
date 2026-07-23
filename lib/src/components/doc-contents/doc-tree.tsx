import Link from "next/link";
import type { TulldocPlugin } from "../../doc/plugin";
import { buildContents, type ContentsNode } from "./contents-data";
import styles from "./doc-tree.module.css";

export interface DocTreeProps {
  /** Slug-префикс раздела; без него выводится всё дерево документации */
  path?: string;
  /** Заголовок над содержанием */
  title?: string;
}

interface DocTreeImplProps extends DocTreeProps {
  contentDir: string;
  plugins?: TulldocPlugin[];
}

/**
 * Книжное содержание: вложенный список разделов, страниц и табов.
 * Данные строятся той же навигацией, что и сайдбар (buildContents).
 */
export function DocTree({
  contentDir,
  plugins,
  path,
  title,
}: DocTreeImplProps) {
  const groups = buildContents(contentDir, { path, plugins });

  return (
    <nav className={styles.Root} aria-label={title ?? "Содержание"}>
      {title && <p className={styles.Title}>{title}</p>}
      {groups.map((group, i) => (
        <div key={group.title ?? `__ungrouped-${i}`} className={styles.Group}>
          {group.title && (
            <span className={styles.GroupLabel}>{group.title}</span>
          )}
          <ul className={styles.List}>
            {group.items.map((node) => (
              <TreeItem key={node.slug} node={node} />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function TreeItem({ node }: { node: ContentsNode }) {
  return (
    <li className={styles.Item}>
      <NodeLink node={node} />
      {node.children?.length ? (
        <ul className={styles.SubList}>
          {node.children.map((child) => (
            <li key={child.slug} className={styles.Item}>
              <NodeLink node={child} />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function NodeLink({ node }: { node: ContentsNode }) {
  if (node.external) {
    return (
      <a
        className={styles.Link}
        href={node.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {node.label}
      </a>
    );
  }
  return (
    <Link className={styles.Link} href={node.href}>
      {node.label}
    </Link>
  );
}
