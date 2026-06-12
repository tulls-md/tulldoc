import { Fragment, type ComponentType, type ReactElement } from "react";
import { ComponentPreview } from "../components/component-preview/component-preview";
import { DocNotice } from "../components/doc-notice/doc-notice";
import { ExampleVariants } from "../components/example-variants/example-variants";
import { PropsTable } from "../components/props-table/props-table";
import { flattenExampleCode } from "../examples/flatten-code";
import { extractPreviewHeight } from "../examples/preview-height";
import { extractComponentProps } from "../props/extract-props";
import { extractPropValueInfo } from "../props/prop-values";
import {
  componentValueName,
  serializeComponentJsx,
} from "../shared/serialize-jsx";
import type { DocStrings } from "../shared/strings";
import { resolveExampleSource } from "../sources/source-index";
import type { DocModel, ResolvedExample } from "./build-model";
import type { DocMeta } from "./doc-meta";

function ManualExample({
  element,
  staticName,
  examplesDir,
  strings,
}: {
  element: ReactElement;
  staticName?: string;
  examplesDir?: string;
  strings: DocStrings;
}) {
  if (!examplesDir) {
    throw new Error(
      "tulldoc: для ручных примеров укажите examplesDir в createDocSource",
    );
  }
  const filePath = resolveExampleSource(examplesDir, element, staticName);
  const code = flattenExampleCode(filePath, examplesDir);
  return (
    <ComponentPreview
      component={element}
      code={code}
      previewHeight={extractPreviewHeight(filePath)}
      showCodeLabel={strings.showCode}
      hideCodeLabel={strings.hideCode}
    />
  );
}

function valueLabel(value: unknown): string {
  if (typeof value === "object" || typeof value === "function") {
    return componentValueName(value) ?? String(value);
  }
  return String(value);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function AutoExample({
  example,
  component,
  source,
  displayName,
  strings,
}: {
  example: Extract<ResolvedExample, { kind: "auto" }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- компонент с произвольными пропсами
  component: ComponentType<any>;
  source: { filePath: string; exportName: string };
  displayName: string;
  strings: DocStrings;
}) {
  const { children, ...attrs } = example.args;
  let values: unknown[];
  let code: string;
  try {
    const info = extractPropValueInfo({ ...source, propName: example.prop });
    if (info.kind === "values") {
      values = info.values;
    } else if (example.args[example.prop] !== undefined) {
      // неперечислимый тип, но значение задано в defaultArgs - один вариант с ним
      values = [example.args[example.prop]];
    } else if (info.kind === "string") {
      values = [capitalize(example.prop)];
    } else if (info.kind === "number") {
      values = [0];
    } else {
      throw new Error(info.reason);
    }
    code = values
      .map((value) =>
        serializeComponentJsx(
          displayName,
          { ...attrs, [example.prop]: value },
          children,
        ),
      )
      .join("\n");
  } catch (error) {
    const reason = (
      error instanceof Error ? error.message : String(error)
    ).replace(/^(ComponentExamples|tulldoc):\s*/, "");
    return (
      <DocNotice>
        {strings.exampleFailed} {reason}
      </DocNotice>
    );
  }

  const Component = component;
  const variants = values.map((value) => ({
    label: valueLabel(value),
    content: (
      <Component {...attrs} {...{ [example.prop]: value }}>
        {children}
      </Component>
    ),
  }));
  return (
    <ExampleVariants
      variants={variants}
      view={example.view}
      code={code}
      showCodeLabel={strings.showCode}
      hideCodeLabel={strings.hideCode}
    />
  );
}

export function DocContent({
  meta,
  model,
  strings,
  examplesDir,
}: {
  meta: DocMeta;
  model: DocModel;
  strings: DocStrings;
  examplesDir?: string;
}) {
  return (
    <>
      <h1>{model.title}</h1>
      {meta.description && <p>{meta.description}</p>}
      {meta.mainExample && (
        <ManualExample
          element={meta.mainExample}
          staticName={model.mainExampleName}
          examplesDir={examplesDir}
          strings={strings}
        />
      )}
      {meta.anatomy && (
        <>
          <h2 id={model.anatomyId}>{strings.anatomy}</h2>
          {meta.anatomy}
        </>
      )}
      {model.examples.length > 0 && (
        <>
          <h2 id={model.examplesId}>{strings.examples}</h2>
          {model.examples.map((example) => (
            <Fragment key={example.id}>
              <h3 id={example.id}>{example.title}</h3>
              {example.description && <p>{example.description}</p>}
              {example.kind === "manual" ? (
                <ManualExample
                  element={example.element}
                  staticName={example.staticName}
                  examplesDir={examplesDir}
                  strings={strings}
                />
              ) : (
                <AutoExample
                  example={example}
                  component={meta.component}
                  source={model.source}
                  displayName={model.displayName}
                  strings={strings}
                />
              )}
            </Fragment>
          ))}
        </>
      )}
      <h2 id={model.apiId}>{strings.api}</h2>
      <PropsTable
        {...extractComponentProps(model.source)}
        emptyText={strings.noProps}
        requiredLabel={strings.required}
        inheritedFromLabel={strings.inheritedFrom}
      />
    </>
  );
}
