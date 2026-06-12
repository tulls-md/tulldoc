"use client";

import { useState, type ReactNode } from "react";
import styles from "./code-block.module.css";

interface CodeBlockCollapseProps {
  children: ReactNode;
  showLabel: string;
  hideLabel: string;
}

export function CodeBlockCollapse({
  children,
  showLabel,
  hideLabel,
}: CodeBlockCollapseProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && children}
      <button
        type="button"
        className={styles.Toggle}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? hideLabel : showLabel}
      </button>
    </>
  );
}
