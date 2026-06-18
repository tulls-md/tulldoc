import { readFileSync } from "fs";
import { isAbsolute, join } from "path";
import {
  extractCssVars,
  type CssVarRow,
  type ExtractCssVarsOptions,
} from "../../shared/extract-css-vars";
import styles from "./css-table.module.css";

interface CssTableProps {
  /** Заголовок над таблицей */
  title: string;
  /** Описание под заголовком */
  description?: string;
  /** Путь к CSS-файлу. Абсолютный или относительно process.cwd() */
  src: string;
  /** Правила отбора: точные имена и/или glob с * (--font-*). Нет → все */
  include?: string[];
  /** Тип сортировки. По умолчанию "value" - умная по значению */
  sort?: ExtractCssVarsOptions["sort"];
  /** Направление сортировки. По умолчанию "asc" */
  direction?: ExtractCssVarsOptions["direction"];
  /** Текст при отсутствии переменных */
  emptyText?: string;
}

const COLOR_RE = /^(#|rgba?\(|hsla?\(|oklch\(|color\()/i;
const NAMED_COLORS = new Set([
  "transparent",
  "currentcolor",
  "black",
  "white",
  "red",
  "green",
  "blue",
]);

function isColor(value: string): boolean {
  const v = value.trim().toLowerCase();
  return COLOR_RE.test(v) || NAMED_COLORS.has(v);
}

/** Размер в пикселях для полоски превью (px/rem/em → px), иначе null */
function sizeInPx(value: string): number | null {
  const match = value.trim().match(/^(-?\d*\.?\d+)(px|rem|em)?$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  if (Number.isNaN(num) || num < 0) return null;
  const unit = match[2];
  return unit === "rem" || unit === "em" ? num * 16 : num;
}

function Preview({ value, maxSize }: { value: string; maxSize: number }) {
  if (isColor(value)) {
    return <span className={styles.Swatch} style={{ background: value }} />;
  }
  const size = sizeInPx(value);
  if (size !== null && maxSize > 0) {
    const width = Math.max(2, Math.round((size / maxSize) * 100));
    return <span className={styles.Bar} style={{ width: `${width}%` }} />;
  }
  return null;
}

export function CssTable({
  title,
  description,
  src,
  include,
  sort,
  direction,
  emptyText = "No CSS variables found.",
}: CssTableProps) {
  const filePath = isAbsolute(src) ? src : join(process.cwd(), src);
  const css = readFileSync(filePath, "utf-8");
  const rows = extractCssVars(css, { include, sort, direction });

  return (
    <div className={styles.Wrapper}>
      <p className={styles.Title}>{title}</p>
      {description && <p className={styles.Subtitle}>{description}</p>}
      {rows.length === 0 ? (
        <p className={styles.Subtitle}>{emptyText}</p>
      ) : (
        <Table rows={rows} />
      )}
    </div>
  );
}

function Table({ rows }: { rows: CssVarRow[] }) {
  const maxSize = rows.reduce((max, row) => {
    const size = sizeInPx(row.value);
    return size !== null && size > max ? size : max;
  }, 0);

  return (
    <div className={styles.Scroll}>
      <table className={styles.Root}>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Value</th>
            <th>Preview</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <code>{row.value}</code>
              </td>
              <td>
                <Preview value={row.value} maxSize={maxSize} />
              </td>
              <td>{row.description ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
