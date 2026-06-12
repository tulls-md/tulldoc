/**
 * Модели данных на границе генератора и UI: сервер строит их из файлов,
 * компоненты только отображают. Живут отдельно, чтобы клиентским компонентам
 * не приходилось импортировать серверные модули ради типов.
 */

export interface NavItem {
  /** Путь документа; у внешней ссылки совпадает с href */
  slug: string;
  label: string;
  group: string | null;
  tabs?: { label: string; slug: string }[];
  /** Внешняя ссылка из meta.json - без страницы, открывается в новой вкладке */
  external?: true;
  href?: string;
}

export interface HeaderItem {
  /** Slug верхнего уровня - для активности ссылки и скрытия сайдбара */
  slug: string;
  label: string;
  /** Ссылка пункта; у дропдауна отсутствует */
  href?: string;
  /** Пункты дропдауна (папка-группа) */
  items?: { href: string; label: string; external?: true }[];
  /** Внешняя ссылка из meta.json - без страницы, открывается в новой вкладке */
  external?: true;
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export interface PaginationLink {
  href: string;
  label: string;
}

export type ExampleView = "grid" | "row" | "cell";

export interface PropRow {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface ComponentPropsInfo {
  /** Пропсы, объявленные в исходниках проекта */
  rows: PropRow[];
  /** Внешние базовые типы (например React.HTMLProps<...>) - одной записью */
  inheritedFrom: string[];
}
