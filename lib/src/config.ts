import createMDX from "@next/mdx";
import type { NextConfig } from "next";

interface TulldocConfigOptions {
  /**
   * Язык по умолчанию для мультиязычного сайта. Если задан, добавляется
   * редирект с "/" на "/{defaultLocale}" (корень не обслуживается напрямую,
   * когда роуты лежат под /[lang]).
   */
  defaultLocale?: string;
}

export function withTulldoc(
  nextConfig: NextConfig = {},
  options: TulldocConfigOptions = {},
): NextConfig {
  const withMDX = createMDX({
    options: {
      remarkPlugins: [
        "remark-gfm",
        "remark-frontmatter",
        "remark-mdx-frontmatter",
        "remark-directive",
        "@tulls-md/tulldoc/remark-lang",
      ],
    },
  });

  const userRedirects = nextConfig.redirects;
  const redirects: NextConfig["redirects"] = options.defaultLocale
    ? async () => [
        ...(userRedirects ? await userRedirects() : []),
        {
          source: "/",
          destination: `/${options.defaultLocale}`,
          permanent: false,
        },
      ]
    : userRedirects;

  return withMDX({
    ...nextConfig,
    ...(redirects ? { redirects } : {}),
    pageExtensions: [
      ...(nextConfig.pageExtensions ?? ["ts", "tsx", "js", "jsx"]),
      "mdx",
    ],
  });
}
