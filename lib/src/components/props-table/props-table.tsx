import { Fragment } from "react";
import type { PropRow } from "../../shared/types";
import styles from "./props-table.module.css";

interface PropsTableProps {
  rows: PropRow[];
  /** Внешние базовые типы пропсов - показываются одной строкой под таблицей */
  inheritedFrom?: string[];
  emptyText?: string;
  requiredLabel?: string;
  inheritedFromLabel?: string;
}

export function PropsTable({
  rows,
  inheritedFrom = [],
  emptyText = "The component takes no props.",
  requiredLabel = "required",
  inheritedFromLabel = "Inherited from",
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
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
                {row.required && (
                  <span className={styles.Required} aria-label={requiredLabel}>
                    *
                  </span>
                )}
                {row.description && (
                  <div className={styles.Description}>{row.description}</div>
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
      {inheritedNote}
    </>
  );
}
