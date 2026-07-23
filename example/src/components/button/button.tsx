import styles from "./button.module.css";

type ButtonVariant = "primary" | "secondary" | "success" | "warning" | "danger";

export interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  /** Текст кнопки. Показывается **всегда**, в отличие от `a` */
  label: string;
  /**
   * Вариант оформления:
   * - `primary` - основное действие
   * - `danger` - разрушительное действие
   *
   * @default "primary"
   */
  variant: ButtonVariant;
  /**
   * Произвольный контент после текста.
   *
   * @deprecated Используйте `label` - проп будет удалён в следующей мажорной версии
   */
  a?: React.ReactNode;
}

export function Button({ label, a }: ButtonProps) {
  return (
    <button className={styles.Root}>
      {label} {a}
    </button>
  );
}
