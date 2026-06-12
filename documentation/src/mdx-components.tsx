import type { MDXComponents } from "mdx/types";
import { getMDXComponents } from "@tulls-md/tulldoc";

export function useMDXComponents(): MDXComponents {
  return getMDXComponents();
}
