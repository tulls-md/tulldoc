import React from "react";
import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "../components/code-block/code-block";
import { Preview } from "../components/preview/preview";
import { slugify } from "../shared/slugify";

function headingId(children: React.ReactNode): string {
  const text =
    typeof children === "string"
      ? children
      : React.Children.toArray(children)
          .map((c) => (typeof c === "string" ? c : ""))
          .join("");
  return slugify(text);
}

export function useMDXComponents(): MDXComponents {
  return getMDXComponents({});
}

export function getMDXComponents(extra: MDXComponents = {}): MDXComponents {
  return {
    Preview,
    h2: ({ children }) => {
      const id = headingId(children);
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children }) => {
      const id = headingId(children);
      return <h3 id={id}>{children}</h3>;
    },
    pre: ({ children }) => {
      const code = children as React.ReactElement<{
        className?: string;
        children: string;
      }>;
      const lang = code.props.className?.replace("language-", "");
      return <CodeBlock lang={lang}>{code.props.children}</CodeBlock>;
    },
    ...extra,
  };
}
