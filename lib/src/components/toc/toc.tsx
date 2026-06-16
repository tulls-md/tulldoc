"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { TocHeading } from "../../shared/types";
import styles from "./toc.module.css";

interface TocProps {
  headings: TocHeading[];
  title?: string;
}

export function TableOfContents({
  headings,
  title = "On this page",
}: TocProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const main = document.querySelector("main");

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        root: main,
        rootMargin: "-10% 0px -80% 0px",
        threshold: 0,
      },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className={styles.Root}>
      <button
        type="button"
        className={styles.Toggle}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((value) => !value)}
      >
        <span className={styles.Title}>{title}</span>
        <span className={styles.Chevron} aria-hidden>
          ▾
        </span>
      </button>
      <ul className={clsx(styles.List, !mobileOpen && styles.Collapsed)}>
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={clsx(
                styles.Link,
                level === 3 && styles.LinkNested,
                activeId === id && styles.LinkActive,
              )}
              onClick={() => setMobileOpen(false)}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
