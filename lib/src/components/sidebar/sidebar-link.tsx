"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import styles from "./sidebar.module.css";

interface SidebarLinkProps {
  href: string;
  label: string;
  activeBasePath?: string;
  external?: boolean;
}

export function SidebarLink({
  href,
  label,
  activeBasePath,
  external,
}: SidebarLinkProps) {
  const pathname = usePathname();
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.Link}
      >
        {label}
        <span className={styles.ExternalIcon} aria-hidden>
          ↗
        </span>
      </a>
    );
  }
  const isActive = activeBasePath
    ? pathname.startsWith(activeBasePath + "/")
    : pathname === href;
  return (
    <Link
      href={href}
      className={clsx(styles.Link, isActive && styles.LinkActive)}
    >
      {label}
    </Link>
  );
}
