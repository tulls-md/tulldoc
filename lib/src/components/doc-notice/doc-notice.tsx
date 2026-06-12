import type { ReactNode } from "react";
import styles from "./doc-notice.module.css";

export function DocNotice({ children }: { children: ReactNode }) {
  return <p className={styles.Root}>{children}</p>;
}
