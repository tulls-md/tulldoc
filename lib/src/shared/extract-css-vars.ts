export interface CssVarRow {
  /** Имя переменной, например --font-size-m */
  name: string;
  /** Значение, например 16px */
  value: string;
  /** Описание из CSS-комментария перед объявлением */
  description?: string;
}

export interface ExtractCssVarsOptions {
  /** Правила отбора: точные имена (--color-bg) и/или glob с * (--font-*). Нет → все */
  include?: string[];
  /** Тип сортировки. По умолчанию "value" - умная по значению */
  sort?: "value" | "name" | "none";
  /** Направление сортировки. По умолчанию "asc" */
  direction?: "asc" | "desc";
}

/**
 * Объявление переменной с необязательным комментарием непосредственно перед ним.
 * Тело комментария не может содержать "*\/" (tempered), поэтому при двух
 * комментариях подряд берётся только прилегающий к объявлению.
 */
const DECLARATION_RE =
  /(?:\/\*\s*((?:[^*]|\*(?!\/))*?)\s*\*\/\s*)?(--[\w-]+)\s*:\s*([^;]+);/g;

/** Превращает элемент include в проверку имени (glob с * или точное совпадение) */
function toMatcher(pattern: string): (name: string) => boolean {
  if (!pattern.includes("*")) return (name) => name === pattern;
  const source = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\*/g, ".*");
  const re = new RegExp(`^${source}$`);
  return (name) => re.test(name);
}

/** Ведущее число из значения (16px, 1.5rem, 50% -> число), иначе null */
function leadingNumber(value: string): number | null {
  const match = value.trim().match(/^-?\d*\.?\d+/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return Number.isNaN(num) ? null : num;
}

/** Умное сравнение значений: числовые по величине, числовые раньше нечисловых */
function compareValues(a: string, b: string): number {
  const na = leadingNumber(a);
  const nb = leadingNumber(b);
  if (na !== null && nb !== null) return na - nb;
  if (na !== null) return -1;
  if (nb !== null) return 1;
  return a.localeCompare(b);
}

/**
 * Извлекает CSS-переменные из исходника, фильтрует по include и сортирует.
 * Дубли имён схлопываются в последнее объявление (как CSS-каскад).
 */
export function extractCssVars(
  css: string,
  options: ExtractCssVarsOptions = {},
): CssVarRow[] {
  const { include, sort = "value", direction = "asc" } = options;

  const byName = new Map<string, CssVarRow>();
  for (const match of css.matchAll(DECLARATION_RE)) {
    const [, rawComment, name, rawValue] = match;
    const value = rawValue.trim();
    const description = rawComment?.replace(/\s+/g, " ").trim();
    byName.set(name, description ? { name, value, description } : { name, value });
  }

  let rows = [...byName.values()];

  if (include && include.length > 0) {
    const matchers = include.map(toMatcher);
    rows = rows.filter((row) => matchers.some((matches) => matches(row.name)));
  }

  if (sort !== "none") {
    const compare =
      sort === "name"
        ? (a: CssVarRow, b: CssVarRow) => a.name.localeCompare(b.name)
        : (a: CssVarRow, b: CssVarRow) => compareValues(a.value, b.value);
    rows.sort(compare);
    if (direction === "desc") rows.reverse();
  }

  return rows;
}
