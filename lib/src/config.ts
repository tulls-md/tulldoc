import createMDX from "@next/mdx";
import { createRequire } from "module";
import type { NextConfig } from "next";

/** Пакеты tulldoc для transpilePackages - аддон добавляется, только если установлен */
function tulldocPackages(): string[] {
  const packages = ["@tulls-md/tulldoc"];
  try {
    createRequire(import.meta.url).resolve(
      "@tulls-md/tulldoc-code/package.json",
    );
    packages.push("@tulls-md/tulldoc-code");
  } catch {
    // аддон @tulls-md/tulldoc-code не установлен - документирование компонентов недоступно
  }
  return packages;
}

export function withTulldoc(nextConfig: NextConfig = {}): NextConfig {
  const withMDX = createMDX({
    options: {
      remarkPlugins: [
        "remark-gfm",
        "remark-frontmatter",
        "remark-mdx-frontmatter",
      ],
    },
  });

  return withMDX({
    ...nextConfig,
    pageExtensions: [
      ...(nextConfig.pageExtensions ?? ["ts", "tsx", "js", "jsx"]),
      "mdx",
    ],
    transpilePackages: [
      ...(nextConfig.transpilePackages ?? []),
      ...tulldocPackages(),
    ],
  });
}
