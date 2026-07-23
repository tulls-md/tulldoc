import { Fragment } from "react";
import { Markdown } from "@tulls-md/tulldoc";
import { propAnchor } from "../../shared/prop-anchors";
import type { PropRow } from "../../shared/types";
import styles from "./props-table.module.css";

interface PropsTableProps {
  rows: PropRow[];
  /** Внешние базовые типы пропсов - показываются одной строкой под таблицей */
  inheritedFrom?: string[];
  /** Префикс якорей строк (см. propsAnchorPrefix); без него строки без id */
  anchorPrefix?: string;
  /** Карта имя-пропа -> href для автолинковки в описаниях */
  codeLinks?: Record<string, string>;
  emptyText?: string;
  requiredLabel?: string;
  inheritedFromLabel?: string;
  deprecatedLabel?: string;
}

export function PropsTable({
  rows,
  inheritedFrom = [],
  anchorPrefix,
  codeLinks,
  emptyText = "The component takes no props.",
  requiredLabel = "required",
  inheritedFromLabel = "Inherited from",
  deprecatedLabel = "deprecated",
}: PropsTableProps) {
  const inheritedNote = inheritedFrom.length > 0 && (
    <p className={styles.Inherited}>
      {inheritedFromLabel}{" "}
      {inheritedFrom.map((typeText, index) => (
        <Fragment key={typeText}>
          {index > 0 && ", "}
          <code>{typeText}</code>
        </Fragment>
      ))}
    </p>
  );
  if (rows.length === 0) {
    return inheritedNote || <p className={styles.Empty}>{emptyText}</p>;
  }
  return (
    <>
      <div className={styles.Scroll}>
        <table className={styles.Root}>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.name}
                id={anchorPrefix && propAnchor(anchorPrefix, row.name)}
              >
                <td>
                  <code>{row.deprecated ? <s>{row.name}</s> : row.name}</code>
                  {row.required && (
                    <span
                      className={styles.Required}
                      aria-label={requiredLabel}
                    >
                      *
                    </span>
                  )}
                  {row.deprecated && (
                    <span className={styles.Deprecated}>{deprecatedLabel}</span>
                  )}
                  {(row.description || typeof row.deprecated === "string") && (
                    <div className={styles.Description}>
                      {typeof row.deprecated === "string" && (
                        <Markdown codeLinks={codeLinks}>
                          {row.deprecated}
                        </Markdown>
                      )}
                      {row.description && (
                        <Markdown codeLinks={codeLinks}>
                          {row.description}
                        </Markdown>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  <code>{row.type}</code>
                </td>
                <td>
                  {row.defaultValue ? <code>{row.defaultValue}</code> : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {inheritedNote}
    </>
  );
}
