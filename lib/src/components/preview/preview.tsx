import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./preview.module.css";

interface PreviewProps {
  children: ReactNode;
  /** Фиксированная высота для контента без собственной высоты (position: fixed, 100dvh) */
  height?: number;
  /** Точечный фон с отступами - единый вид примеров */
  canvas?: boolean;
}

export function Preview({ children, height, canvas }: PreviewProps) {
  return (
    <div
      className={clsx(styles.Root, canvas && styles.Canvas)}
      style={height !== undefined ? { height } : undefined}
    >
      {children}
    </div>
  );
}
