/**
 * Типы документирования компонентов на границе генератора и UI: сервер строит
 * их из исходников, компоненты только отображают.
 */

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
