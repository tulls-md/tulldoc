/**
 * Типы документирования компонентов на границе генератора и UI: сервер строит
 * их из исходников, компоненты только отображают.
 */

/** grid и cell - раскладка вариантов на точечном канвасе, plain - без канваса */
export type ExampleView = "grid" | "cell" | "plain";

export interface PropRow {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  /** Текст JSDoc-тега @deprecated или true для тега без текста */
  deprecated?: string | true;
}

export interface ComponentPropsInfo {
  /** Пропсы, объявленные в исходниках проекта */
  rows: PropRow[];
  /** Внешние базовые типы (например React.HTMLProps<...>) - одной записью */
  inheritedFrom: string[];
}
