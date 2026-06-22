import type { CSSProperties } from "react";
import Link from "next/link";
import type { TulldocPlugin } from "../../doc/plugin";
import { buildContents, type ContentsNode } from "./contents-data";
import styles from "./doc-cards.module.css";

export interface DocCardsProps {
  /** Slug-префикс раздела; без него выводятся карточки всего дерева */
  path?: string;
  /** Число колонок сетки. По умолчанию 2 */
  columns?: number;
}

interface DocCardsImplProps extends DocCardsProps {
  contentDir: string;
  plugins?: TulldocPlugin[];
}

/**
 * Карточное содержание: сетка блоков с превью, заголовком и описанием.
 * Превью берётся из frontmatter `cover`, иначе строится плейсхолдер.
 */
export function DocCards({
  contentDir,
  plugins,
  path,
  columns = 2,
}: DocCardsImplProps) {
  const nodes = buildContents(contentDir, { path, plugins }).flatMap(
    (group) => group.items,
  );

  return (
    <div
      className={styles.Grid}
      style={{ "--doc-cards-columns": columns } as CSSProperties}
    >
      {nodes.map((node) => (
        <Card key={node.slug} node={node} />
      ))}
    </div>
  );
}

function Card({ node }: { node: ContentsNode }) {
  const inner = (
    <>
      <div className={styles.Cover}>
        {node.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.CoverImage} src={node.cover} alt="" />
        ) : (
          <Placeholder label={node.label} />
        )}
      </div>
      <div className={styles.Body}>
        <span className={styles.CardTitle}>{node.label}</span>
        {node.description && (
          <span className={styles.CardDescription}>{node.description}</span>
        )}
      </div>
    </>
  );

  if (node.external) {
    return (
      <a
        className={styles.Card}
        href={node.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link className={styles.Card} href={node.href}>
      {inner}
    </Link>
  );
}

/** Инициалы из первых двух слов заголовка */
function initials(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/** Стабильный оттенок (0-359) из строки */
function hashHue(label: string): number {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) % 360;
  }
  return hash;
}

function Placeholder({ label }: { label: string }) {
  const hue = hashHue(label);
  const background = `linear-gradient(135deg, hsl(${hue} 60% 92%), hsl(${
    (hue + 40) % 360
  } 55% 82%))`;
  return (
    <div className={styles.Placeholder} style={{ background }}>
      <span
        className={styles.PlaceholderText}
        style={{ color: `hsl(${hue} 45% 35%)` }}
      >
        {initials(label)}
      </span>
    </div>
  );
}
