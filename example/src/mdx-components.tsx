import { join } from "path";
import type { MDXComponents } from "mdx/types";
import { getMDXComponents } from "@tulls-md/tulldoc";
import { createDocContents } from "@tulls-md/tulldoc/server";
import {
  createComponentExamples,
  createComponentProps,
} from "@tulls-md/tulldoc-code/server";

const { DocTree, DocCards } = createDocContents(
  join(process.cwd(), "src/content"),
);

export function useMDXComponents(): MDXComponents {
  return getMDXComponents({
    DocTree,
    DocCards,
    ComponentProps: createComponentProps(
      join(process.cwd(), "src/components"),
      "ru",
    ),
    ComponentExamples: createComponentExamples(
      join(process.cwd(), "src/examples"),
      (path) => import(`./examples/${path}.tsx`),
      "ru",
    ),
  });
}
