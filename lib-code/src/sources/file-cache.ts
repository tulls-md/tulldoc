import { statSync } from "fs";

/**
 * Мемоизация вычисления по файлу: результат хранится по ключу (по умолчанию -
 * путь файла) и пересчитывается, когда меняется mtime файла.
 */
export function createFileCache<A extends unknown[], R>(
  compute: (filePath: string, ...args: A) => R,
  key?: (filePath: string, ...args: A) => string,
): (filePath: string, ...args: A) => R {
  const cache = new Map<string, { mtime: number; result: R }>();
  return (filePath, ...args) => {
    const mtime = statSync(filePath).mtimeMs;
    const cacheKey = key ? key(filePath, ...args) : filePath;
    const cached = cache.get(cacheKey);
    if (cached && cached.mtime === mtime) return cached.result;
    const result = compute(filePath, ...args);
    cache.set(cacheKey, { mtime, result });
    return result;
  };
}
