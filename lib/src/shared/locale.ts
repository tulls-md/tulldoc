/**
 * Локализуемое значение: либо само значение (одно на все языки), либо карта
 * "локаль -> значение". Используется для title/description во frontmatter,
 * DocMeta, meta.json и описаний пропсов из JSDoc.
 */
export type Localized<T> = T | { [locale: string]: T };

/** Конфигурация локалей сайта - результат разбора опций createDocSource */
export interface LocaleConfig {
  locales: string[];
  defaultLocale: string;
  /** Мультиязычный режим: больше одной локали - включается роутинг по /[lang] */
  multi: boolean;
}

export function resolveLocaleConfig(options: {
  locales?: string[];
  defaultLocale?: string;
  lang?: string;
}): LocaleConfig {
  const locales =
    options.locales && options.locales.length > 0
      ? options.locales
      : [options.lang ?? "en"];
  const defaultLocale =
    options.defaultLocale && locales.includes(options.defaultLocale)
      ? options.defaultLocale
      : locales[0];
  return { locales, defaultLocale, multi: locales.length > 1 };
}

/** Значение - карта локалей, а не само значение */
export function isLocaleMap(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value as object).length > 0 &&
    Object.values(value as object).every((v) => typeof v === "string")
  );
}

/**
 * Выбирает значение для активной локали: точное совпадение, иначе язык по
 * умолчанию, иначе первое доступное. Не-карта возвращается как есть.
 */
export function resolveLocalized<T>(
  value: Localized<T>,
  locale: string,
  defaultLocale: string,
): T {
  if (!isLocaleMap(value)) return value as T;
  const map = value as Record<string, T>;
  if (locale in map) return map[locale];
  if (defaultLocale in map) return map[defaultLocale];
  return Object.values(map)[0];
}
