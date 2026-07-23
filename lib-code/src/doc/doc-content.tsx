import {
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";
import { DocNotice, Markdown, Preview } from "@tulls-md/tulldoc";
import { ComponentPreview } from "../components/component-preview/component-preview";
import { ExampleVariants } from "../components/example-variants/example-variants";
import { PropsTable } from "../components/props-table/props-table";
import { flattenExampleCode } from "../examples/flatten-code";
import { extractPreviewHeight } from "../examples/preview-height";
import { extractComponentProps } from "../props/extract-props";
import { extractPropValueInfo, isBooleanPair } from "../props/prop-values";
import {
  propAnchor,
  propCodeLinks,
  propsAnchorPrefix,
} from "../shared/prop-anchors";
import {
  componentValueName,
  serializeComponentJsx,
} from "../shared/serialize-jsx";
import type { DocStrings } from "@tulls-md/tulldoc";
import type { ExampleView } from "../shared/types";
import { resolveExampleSource } from "../sources/source-index";
import type { DocModel, ResolvedExample } from "./build-model";
import type { DocMeta } from "./doc-meta";
import styles from "./doc-content.module.css";

function ManualExample({
  element,
  staticName,
  examplesDir,
  strings,
  view,
}: {
  element: ReactElement;
  staticName?: string;
  examplesDir?: string;
  strings: DocStrings;
  view?: ExampleView;
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
      view={view}
      showCodeLabel={strings.showCode}
      hideCodeLabel={strings.hideCode}
    />
  );
}

function MainArgsExample({
  component,
  args,
  displayName,
  strings,
  view = "grid",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  args: Record<string, unknown>;
  displayName: string;
  strings: DocStrings;
  view?: ExampleView;
}) {
  const { children, ...attrs } = args;
  const Component = component;
  let code: string | undefined;
  try {
    code = serializeComponentJsx(displayName, attrs, children);
  } catch {
    // Несериализуемые пропсы - показываем пример без код-блока
    code = undefined;
  }
  const element = <Component {...attrs}>{children as ReactNode}</Component>;
  if (code === undefined) {
    return <Preview canvas={view !== "plain"}>{element}</Preview>;
  }
  return (
    <ComponentPreview
      component={element}
      code={code}
      view={view}
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
    if (info.kind === "values" && isBooleanPair(info.values)) {
      // boolean - показываем только недефолтное значение, один вариант
      const row = extractComponentProps(source).rows.find(
        (r) => r.name === example.prop,
      );
      const componentDefault =
        row?.defaultValue === "true"
          ? true
          : row?.defaultValue === "false"
            ? false
            : undefined;
      const argDefault = example.args[example.prop];
      const defaultValue =
        typeof argDefault === "boolean"
          ? argDefault
          : (componentDefault ?? false);
      values = [!defaultValue];
    } else if (info.kind === "values") {
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
  const mainInfo = extractComponentProps(model.source);
  const mainPrefix = propsAnchorPrefix(model.displayName);
  const mainCodeLinks = propCodeLinks(mainInfo.rows, mainPrefix);
  return (
    <>
      <h1>{model.title}</h1>
      {meta.description && (
        <Markdown codeLinks={mainCodeLinks}>{meta.description}</Markdown>
      )}
      {meta.mainExample &&
        (isValidElement(meta.mainExample) ? (
          <ManualExample
            element={meta.mainExample}
            staticName={model.mainExampleName}
            examplesDir={examplesDir}
            strings={strings}
            view={meta.mainExampleView}
          />
        ) : (
          <MainArgsExample
            component={meta.component}
            args={meta.mainExample as Record<string, unknown>}
            displayName={model.displayName}
            strings={strings}
            view={meta.mainExampleView}
          />
        ))}
      {meta.anatomy && (
        <>
          <h2 id={model.anatomyId}>{strings.anatomy}</h2>
          {meta.anatomy}
        </>
      )}
      {model.examples.length > 0 && (
        <>
          <h2 id={model.examplesId}>{strings.examples}</h2>
          {model.examples.map((example) => {
            const showPropChip =
              example.kind === "auto" && example.title !== example.prop;
            return (
              <Fragment key={example.id}>
                <h3
                  id={example.id}
                  className={showPropChip ? styles.ExampleHeading : undefined}
                >
                  {example.title}
                  {showPropChip && (
                    <a
                      className={styles.PropChip}
                      href={`#${propAnchor(mainPrefix, example.prop)}`}
                    >
                      <code>{example.prop}</code>
                    </a>
                  )}
                </h3>
                {example.description && (
                  <Markdown codeLinks={mainCodeLinks}>
                    {example.description}
                  </Markdown>
                )}
                {example.kind === "manual" ? (
                  <ManualExample
                    element={example.element}
                    staticName={example.staticName}
                    examplesDir={examplesDir}
                    strings={strings}
                    view={example.view}
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
            );
          })}
        </>
      )}
      <h2 id={model.apiId}>{strings.api}</h2>
      <PropsTable
        {...mainInfo}
        anchorPrefix={mainPrefix}
        codeLinks={mainCodeLinks}
        emptyText={strings.noProps}
        requiredLabel={strings.required}
        inheritedFromLabel={strings.inheritedFrom}
        deprecatedLabel={strings.deprecated}
      />
      {model.subcomponents.map((sub) => {
        const info = extractComponentProps(sub.source);
        const prefix = propsAnchorPrefix(sub.displayName);
        // Свои пропы подкомпонента важнее одноимённых пропов главного
        const codeLinks = {
          ...mainCodeLinks,
          ...propCodeLinks(info.rows, prefix),
        };
        return (
          <Fragment key={sub.id}>
            <h3 id={sub.id}>{sub.displayName}</h3>
            {sub.description && (
              <Markdown codeLinks={codeLinks}>{sub.description}</Markdown>
            )}
            <PropsTable
              {...info}
              anchorPrefix={prefix}
              codeLinks={codeLinks}
              emptyText={strings.noProps}
              requiredLabel={strings.required}
              inheritedFromLabel={strings.inheritedFrom}
              deprecatedLabel={strings.deprecated}
            />
          </Fragment>
        );
      })}
    </>
  );
}
