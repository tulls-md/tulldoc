"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import styles from "./header.module.css";

interface HeaderDropdownProps {
  label: string;
  basePath: string;
  items: { href: string; label: string; external?: true }[];
}

export function HeaderDropdown({
  label,
  basePath,
  items,
}: HeaderDropdownProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isActive = pathname === basePath || pathname.startsWith(basePath + "/");

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div ref={rootRef} className={styles.Dropdown}>
      <button
        type="button"
        className={clsx(styles.Link, isActive && styles.LinkActive)}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <span className={styles.DropdownArrow} aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className={styles.DropdownMenu}>
          {items.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.DropdownItem}
              >
                {item.label}
                <span className={styles.ExternalIcon} aria-hidden>
                  ↗
                </span>
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  styles.DropdownItem,
                  pathname === item.href && styles.DropdownItemActive,
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
