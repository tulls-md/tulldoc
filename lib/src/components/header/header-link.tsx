"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import styles from "./header.module.css";

interface HeaderLinkProps {
  href: string;
  label: string;
  /** Активна, когда pathname под этим путём */
  basePath?: string;
  /** Активна, когда pathname НЕ под одним из этих путей - для ссылки на основную документацию */
  excludePaths?: string[];
}

function isUnder(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(basePath + "/");
}

export function HeaderLink({
  href,
  label,
  basePath,
  excludePaths,
}: HeaderLinkProps) {
  const pathname = usePathname();
  const isActive = basePath
    ? isUnder(pathname, basePath)
    : !excludePaths?.some((path) => isUnder(pathname, path));
  return (
    <Link
      href={href}
      className={clsx(styles.Link, isActive && styles.LinkActive)}
    >
      {label}
    </Link>
  );
}
