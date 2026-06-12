import type { ReactNode } from "react";
import styles from "./preview.module.css";

interface PreviewProps {
  children: ReactNode;
  /** Фиксированная высота для контента без собственной высоты (position: fixed, 100dvh) */
  height?: number;
}

export function Preview({ children, height }: PreviewProps) {
  return (
    <div
      className={styles.Root}
      style={height !== undefined ? { height } : undefined}
    >
      {children}
    </div>
  );
}
