"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import styles from "./mobile-nav.module.css";

interface MobileNavValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const MobileNavContext = createContext<MobileNavValue | null>(null);

export function useMobileNav(): MobileNavValue {
  const value = useContext(MobileNavContext);
  if (!value) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return value;
}

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  // Закрываем меню при переходе на другую страницу
  useEffect(() => setOpen(false), [pathname]);

  // Закрытие по Escape и блокировка скролла body, пока меню открыто
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const value = useMemo(() => ({ open, toggle, close }), [open, toggle, close]);

  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function MenuButton({ headerSlugs = [] }: { headerSlugs?: string[] }) {
  const { open, toggle } = useMobileNav();
  const pathname = usePathname();
  // На страницах шапки сайдбара нет - бургеру нечего открывать
  const isHeaderPage = headerSlugs.some(
    (slug) => pathname === `/${slug}` || pathname.startsWith(`/${slug}/`),
  );
  if (isHeaderPage) return null;
  return (
    <button
      type="button"
      className={styles.MenuButton}
      aria-label="Toggle navigation"
      aria-expanded={open}
      aria-controls="tulldoc-sidebar"
      onClick={toggle}
    >
      <span className={styles.Icon} aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}
