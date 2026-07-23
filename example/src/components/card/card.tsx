import type { ReactNode } from "react";
import styles from "./card.module.css";

interface CardRootProps {
  /** Зоны карточки: `Card.Header`, `Card.Content` - или произвольный контент */
  children: ReactNode;
  /** Режим загрузки - контент приглушается до завершения */
  isLoading?: boolean;
}

function CardRoot({ children, isLoading = false }: CardRootProps) {
  return (
    <div className={styles.Root} data-loading={isLoading || undefined}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  /** Заголовок карточки */
  title: string;
  /**
   * Подпись под заголовком
   *
   * @default "Без подписи"
   */
  subtitle?: string;
}

function CardHeader({ title, subtitle = "Без подписи" }: CardHeaderProps) {
  return (
    <div className={styles.Header}>
      <strong>{title}</strong>
      <span className={styles.Subtitle}>{subtitle}</span>
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
}

function CardContent({ children }: CardContentProps) {
  return <div className={styles.Content}>{children}</div>;
}

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Content: CardContent,
};
