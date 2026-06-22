import { readFileSync } from "fs";
import { isAbsolute, join } from "path";
import {
  extractCssVars,
  type CssVarRow,
  type ExtractCssVarsOptions,
} from "../../shared/extract-css-vars";
import styles from "./font-specimen.module.css";

interface FontSpecimenProps {
  /** Заголовок над списком */
  title: string;
  /** Описание под заголовком */
  description?: string;
  /** Путь к CSS-файлу. Абсолютный или относительно process.cwd() */
  src: string;
  /** Правила отбора: точные имена и/или glob с * (--font-*). По умолчанию ["--font-*"] */
  include?: string[];
  /** Тип сортировки. По умолчанию "value" - умная по значению */
  sort?: ExtractCssVarsOptions["sort"];
  /** Направление сортировки. По умолчанию "asc" */
  direction?: ExtractCssVarsOptions["direction"];
  /** Текст примера для всех строк */
  sampleText?: string;
  /** Текст при отсутствии переменных */
  emptyText?: string;
}

const DEFAULT_SAMPLE = "Съешь же ещё этих мягких булочек. The quick brown fox.";

/**
 * Значение является `font` shorthand (роль-шрифт), а не атомарным размером/весом.
 * Эвристика: содержит line-height через "/" и ссылку на семейство.
 */
function isFontShorthand(value: string): boolean {
  return value.includes("/") && /font|sans|serif|monospace/i.test(value);
}

/** Раскрывает var(--x) по карте переменных рекурсивно, иначе возвращает токен как есть */
function resolveVar(
  token: string,
  map: Map<string, string>,
  depth = 0,
): string {
  const match = token.trim().match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (!match || depth > 10) return token.trim();
  const next = map.get(match[1]);
  return next ? resolveVar(next, map, depth + 1) : token.trim();
}

/** Извлекает токен размера из font shorthand (часть перед "/"), раскрывает его */
function resolveFontSize(
  value: string,
  map: Map<string, string>,
): string | null {
  const slash = value.indexOf("/");
  if (slash === -1) return null;
  const beforeSlash = value.slice(0, slash);
  const sizeToken = beforeSlash
    .trim()
    .split(/\s+(?![^(]*\))/)
    .pop();
  if (!sizeToken) return null;
  return resolveVar(sizeToken, map);
}

export function FontSpecimen({
  title,
  description,
  src,
  include,
  sort,
  direction,
  sampleText = DEFAULT_SAMPLE,
  emptyText = "No font variables found.",
}: FontSpecimenProps) {
  const filePath = isAbsolute(src) ? src : join(process.cwd(), src);
  const css = readFileSync(filePath, "utf-8");

  const varMap = new Map(
    extractCssVars(css, { sort: "none" }).map((row) => [row.name, row.value]),
  );
  const rows = extractCssVars(css, {
    include: include ?? ["--font-*"],
    sort,
    direction,
  }).filter((row) => isFontShorthand(row.value));

  return (
    <div className={styles.Wrapper}>
      <p className={styles.Title}>{title}</p>
      {description && <p className={styles.Subtitle}>{description}</p>}
      {rows.length === 0 ? (
        <p className={styles.Subtitle}>{emptyText}</p>
      ) : (
        <ul className={styles.List}>
          {rows.map((row) => (
            <Specimen
              key={row.name}
              row={row}
              size={resolveFontSize(row.value, varMap)}
              sampleText={sampleText}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Specimen({
  row,
  size,
  sampleText,
}: {
  row: CssVarRow;
  size: string | null;
  sampleText: string;
}) {
  return (
    <li className={styles.Item}>
      <div className={styles.Meta}>
        <code className={styles.Name}>{row.name}</code>
        {size && <span className={styles.Size}>{size}</span>}
        {row.description && (
          <span className={styles.Description}>{row.description}</span>
        )}
      </div>
      <p className={styles.Sample} style={{ font: `var(${row.name})` }}>
        {sampleText}
      </p>
    </li>
  );
}
