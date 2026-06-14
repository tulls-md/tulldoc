import createMDX from "@next/mdx";
import type { NextConfig } from "next";

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
  });
}
