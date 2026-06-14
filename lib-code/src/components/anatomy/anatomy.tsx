import type { ReactNode } from "react";
import styles from "./anatomy.module.css";

interface AnatomyPartProps {
  label: string;
  children?: ReactNode;
  grow?: boolean;
}

function Part({ label, children, grow }: AnatomyPartProps) {
  return (
    <div className={styles.Part} style={grow ? { flex: 1 } : undefined}>
      <span className={styles.Label}>{label}</span>
      {children}
    </div>
  );
}

function Root({ children }: { children: ReactNode }) {
  return <div className={styles.Root}>{children}</div>;
}

export const Anatomy = { Root, Part };
