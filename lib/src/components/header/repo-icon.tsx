// SSR-вариант phosphor без IconContext - безопасен в серверных компонентах
import { GithubLogo, GitlabLogo } from "@phosphor-icons/react/ssr";
import type { RepoProvider } from "../../shared/repo";

interface RepoIconProps {
  provider: RepoProvider;
}

/** Иконка репозитория */
export function RepoIcon({ provider }: RepoIconProps) {
  const Icon = provider === "gitlab" ? GitlabLogo : GithubLogo;
  return <Icon size={18} weight="fill" />;
}
