import { join } from "path";
import type { ComponentType } from "react";
import { ComponentPreview } from "../components/component-preview/component-preview";
import { flattenExampleCode } from "../examples/flatten-code";
import { extractPreviewHeight } from "../examples/preview-height";
import { getDocStrings } from "@tulls-md/tulldoc";

type ImportFn = (path: string) => Promise<{ default: ComponentType }>;

export function createComponentPreview(
  examplesDir: string,
  importFn: ImportFn,
  lang?: string,
) {
  const strings = getDocStrings(lang);
  return async function AppComponentPreview({ path }: { path: string }) {
    const filePath = join(examplesDir, `${path}.tsx`);
    const code = flattenExampleCode(filePath, examplesDir);
    const { default: Example } = await importFn(path);
    return (
      <ComponentPreview
        component={<Example />}
        code={code}
        previewHeight={extractPreviewHeight(filePath)}
        showCodeLabel={strings.showCode}
        hideCodeLabel={strings.hideCode}
      />
    );
  };
}
