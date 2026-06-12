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
      <p className={styles.Title}>{title}</p>
      <ul className={styles.List}>
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={clsx(
                styles.Link,
                level === 3 && styles.LinkNested,
                activeId === id && styles.LinkActive,
              )}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
