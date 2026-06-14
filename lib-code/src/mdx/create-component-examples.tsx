import { join } from "path";
import type { ComponentType } from "react";
import { ExampleVariants } from "../components/example-variants/example-variants";
import type { ExampleView } from "../shared/types";
import { extractPropValues } from "../props/prop-values";
import { extractPreviewHeight } from "../examples/preview-height";
import { generateVariantsCode } from "../examples/variants-code";
import { getDocStrings } from "@tulls-md/tulldoc";

type ImportFn = (path: string) => Promise<{ default: ComponentType }>;

export function createComponentExamples(
  examplesDir: string,
  importFn: ImportFn,
  lang?: string,
) {
  const strings = getDocStrings(lang);
  return async function AppComponentExamples({
    path,
    prop,
    view = "row",
    defaultArgs = {},
  }: {
    path: string;
    prop: string;
    view?: ExampleView;
    defaultArgs?: Record<string, unknown>;
  }) {
    const filePath = join(examplesDir, `${path}.tsx`);
    const values = extractPropValues({ filePath, propName: prop });
    const { default: Example } = await importFn(path);
    const VariantExample = Example as ComponentType<Record<string, unknown>>;
    const code = generateVariantsCode({
      filePath,
      examplesDir,
      prop,
      values,
      defaultArgs,
    });
    const variants = values.map((value) => ({
      label: String(value),
      content: <VariantExample {...defaultArgs} {...{ [prop]: value }} />,
    }));
    return (
      <ExampleVariants
        variants={variants}
        view={view}
        code={code}
        previewHeight={extractPreviewHeight(filePath)}
        showCodeLabel={strings.showCode}
        hideCodeLabel={strings.hideCode}
      />
    );
  };
}
