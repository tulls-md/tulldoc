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
  /** По умолчанию - имя пропа */
  title?: string;
  description?: string;
  view?: ExampleView;
  /** Дополняет/перекрывает defaultArgs документа для этого примера */
  defaultArgs?: Partial<P>;
  /** true - не показывать автопример этого пропа */
  disabled?: boolean;
}

export interface DocManualExample {
  title: string;
  description?: string;
  /** Готовый компонент-пример из examplesDir; код извлекается из его файла */
  example: ReactElement;
}

export type DocExample<P> = DocAutoExample<P> | DocManualExample;

/**
 * Автопримеры генерируются для всех пропсов компонента; запись в examples
 * с prop настраивает (или через disabled отключает) пример этого пропа.
 * defaultArgs - значения остальных пропсов при рендере каждого примера.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ковариантность по пропсам произвольного компонента
export interface DocMeta<C extends ComponentType<any> = ComponentType<any>> {
  /** По умолчанию - имя компонента */
  title?: string;
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
   *   код-блок не показывается.
   */
  mainExample?: ReactElement | Partial<ComponentProps<C>>;
  defaultArgs?: Partial<ComponentProps<C>>;
  examples?: DocExample<ComponentProps<C>>[];
}
