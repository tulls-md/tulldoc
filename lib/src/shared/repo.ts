/**
 * Построение ссылок на репозиторий (GitHub/GitLab). Серверный модуль:
 * использует fs для поиска корня git. Не импортировать из клиентских компонентов.
 */
import { existsSync } from "fs";
import { dirname, join, relative } from "path";

export type RepoProvider = "github" | "gitlab";

export interface RepoConfig {
  /** Адрес репозитория, напр. https://github.com/tulls-md/tulldoc */
  url: string;
  /** Ветка для ссылок; по умолчанию "main" */
  branch?: string;
  /** Провайдер; по умолчанию определяется по хосту url */
  provider?: RepoProvider;
}

const gitRootCache = new Map<string, string | undefined>();

/** Поднимается вверх от startDir в поисках каталога/файла .git */
export function findGitRoot(startDir: string): string | undefined {
  if (gitRootCache.has(startDir)) return gitRootCache.get(startDir);
  let dir = startDir;
  for (;;) {
    if (existsSync(join(dir, ".git"))) {
      gitRootCache.set(startDir, dir);
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  gitRootCache.set(startDir, undefined);
  return undefined;
}

/** Провайдер по хосту url; undefined, если хост нестандартный */
export function detectProvider(url: string): RepoProvider | undefined {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return undefined;
  }
  if (host === "github.com") return "github";
  if (host === "gitlab.com" || host.startsWith("gitlab.")) return "gitlab";
  return undefined;
}

/** Итоговый провайдер: явный из конфига, иначе по хосту, иначе github */
export function resolveProvider(repo: RepoConfig): RepoProvider {
  return repo.provider ?? detectProvider(repo.url) ?? "github";
}

/**
 * Ссылка на конкретный файл в репозитории. Путь вычисляется относительно
 * корня git. Если корень не найден - undefined (ссылку не показываем).
 */
export function buildSourceUrl(
  repo: RepoConfig,
  filePath: string,
  gitRoot: string | undefined,
): string | undefined {
  if (!gitRoot) return undefined;
  const rel = relative(gitRoot, filePath).split("\\").join("/");
  const base = repo.url.replace(/\/+$/, "");
  const branch = repo.branch ?? "main";
  const provider = resolveProvider(repo);
  const blob = provider === "gitlab" ? "/-/blob/" : "/blob/";
  return `${base}${blob}${branch}/${rel}`;
}
