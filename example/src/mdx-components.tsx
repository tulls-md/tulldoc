import { join } from "path";
import type { MDXComponents } from "mdx/types";
import { getMDXComponents } from "@tulls-md/tulldoc";
import {
  createComponentExamples,
  createComponentProps,
} from "@tulls-md/tulldoc/server";

export function useMDXComponents(): MDXComponents {
  return getMDXComponents({
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
