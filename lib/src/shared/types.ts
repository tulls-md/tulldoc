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
  /** Slug верхнего уровня - для активности ссылки */
  slug: string;
  label: string;
  /** Ссылка пункта; у дропдауна отсутствует */
  href?: string;
  /** Пункты дропдауна (папка-группа) */
  items?: { href: string; label: string; external?: true }[];
  /** Внешняя ссылка из meta.json - без страницы, открывается в новой вкладке */
  external?: true;
}

export interface Section {
  /** URL-сегмент раздела; null у раздела по умолчанию (корневые файлы) */
  slug: string | null;
  label: string;
  /** Боковое меню именно этого раздела */
  sidebarItems: NavItem[];
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

export interface SourceLink {
  href: string;
  label: string;
  /** edit - файл страницы (.mdx/.doc.tsx); component - исходник компонента */
  kind: "edit" | "component";
}
