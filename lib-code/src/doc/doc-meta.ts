import type {
  ComponentProps,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react";
import type { ExampleView } from "../shared/types";

export interface DocAutoExample<P> {
  /** Проп, значения которого перебираются - список берётся из его TS-типа */
  prop: keyof P & string;
  /** По умолчанию - имя пропа; заданный title показывается вместе с пропом */
  title?: string;
  /** Markdown: инлайн-разметка и списки */
  description?: string;
  view?: ExampleView;
  /** Дополняет/перекрывает defaultArgs документа для этого примера */
  defaultArgs?: Partial<P>;
  /** true - не показывать автопример этого пропа */
  disabled?: boolean;
}

export interface DocManualExample {
  title: string;
  /** Markdown: инлайн-разметка и списки */
  description?: string;
  /** Готовый компонент-пример из examplesDir; код извлекается из его файла */
  example: ReactElement;
  /**
   * plain - без точечного канваса (для полноэкранных примеров).
   * По умолчанию канвас включён.
   */
  view?: ExampleView;
}

export type DocExample<P> = DocAutoExample<P> | DocManualExample;

/** Подкомпонент сборного компонента - отдельная таблица в секции API */
export interface DocSubcomponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- произвольный компонент
  component: ComponentType<any>;
  /** Как у DocMeta.componentName; по умолчанию - имя функции */
  componentName?: string;
  /** Markdown: инлайн-разметка и списки */
  description?: string;
}

/**
 * Автопримеры генерируются для всех пропсов компонента; запись в examples
 * с prop настраивает (или через disabled отключает) пример этого пропа.
 * defaultArgs - значения остальных пропсов при рендере каждого примера.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ковариантность по пропсам произвольного компонента
export interface DocMeta<C extends ComponentType<any> = ComponentType<any>> {
  /** По умолчанию - имя компонента */
  title?: string;
  /** Markdown: инлайн-разметка и списки */
  description?: string;
  anatomy?: ReactNode;
  component: C;
  /**
   * Имя для показа в коде примеров и поиска исходника, если имя функции
   * ненадёжно (минификация, обёртки) или отличается от JSX-имени.
   * Точки при поиске игнорируются: "Layout.Header" -> функция LayoutHeader.
   */
  componentName?: string;
  /**
   * Главный пример - показывается сразу под описанием, над анатомией.
   * Два режима:
   * - ReactElement: готовый компонент-пример из examplesDir; код показывается
   *   целиком, с импортами.
   * - объект пропсов: пример строится автоматически - документируемый компонент
   *   рендерится с этими пропсами (children задаётся ключом children),
   *   код-блок генерируется из пропсов (только сериализуемые значения).
   */
  mainExample?: ReactElement | Partial<ComponentProps<C>>;
  /** Вид главного примера; plain - без точечного канваса */
  mainExampleView?: ExampleView;
  defaultArgs?: Partial<ComponentProps<C>>;
  examples?: DocExample<ComponentProps<C>>[];
  /**
   * Подкомпоненты сборного компонента - для каждого в секции API рендерится
   * отдельная таблица пропсов. Автопримеры из их пропсов не генерируются.
   */
  subcomponents?: DocSubcomponent[];
}
