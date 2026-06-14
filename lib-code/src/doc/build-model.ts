import type { ReactElement } from "react";
import { slugify } from "@tulls-md/tulldoc";
import type { DocStrings, TocHeading } from "@tulls-md/tulldoc";
import { extractComponentProps } from "../props/extract-props";
import { resolveComponentSource } from "../sources/source-index";
import type { ExampleView } from "../shared/types";
import type { DocMeta } from "./doc-meta";
import type { DocStaticInfo } from "./static-info";

export type ResolvedExample =
  | {
      kind: "auto";
      id: string;
      title: string;
      description?: string;
      prop: string;
      view: ExampleView;
      args: Record<string, unknown>;
    }
  | {
      kind: "manual";
      id: string;
      title: string;
      description?: string;
      element: ReactElement;
      staticName?: string;
    };

type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

export interface DocModel {
  title: string;
  headings: TocHeading[];
  anatomyId?: string;
  examplesId?: string;
  apiId: string;
  examples: ResolvedExample[];
  mainExampleName?: string;
  source: { filePath: string; exportName: string };
  displayName: string;
}

/**
 * Итоговая структура .doc.tsx-страницы. Автопримеры создаются для всех
 * пропсов компонента; запись examples с prop настраивает пример или
 * отключает его (disabled). Сконфигурированные примеры идут первыми в
 * порядке конфигурации, остальные пропсы - в порядке объявления.
 */
export function buildDocModel({
  meta,
  strings,
  componentsDir,
  staticInfo,
}: {
  meta: DocMeta;
  strings: DocStrings;
  componentsDir?: string;
  staticInfo?: DocStaticInfo;
}): DocModel {
  if (!componentsDir) {
    throw new Error(
      "tulldoc: для .doc.tsx укажите componentsDir в createDocSource",
    );
  }
  const source = resolveComponentSource(
    componentsDir,
    meta.component,
    meta.componentName ?? staticInfo?.componentName,
  );
  const displayName =
    meta.componentName ?? staticInfo?.componentName ?? source.exportName;
  const title = meta.title ?? displayName;
  const { rows } = extractComponentProps(source);

  const defaultArgs = meta.defaultArgs ?? {};
  const examples: DistributiveOmit<ResolvedExample, "id">[] = [];
  const configuredProps = new Set<string>();
  (meta.examples ?? []).forEach((entry, index) => {
    if ("example" in entry) {
      examples.push({
        kind: "manual",
        title: entry.title,
        description: entry.description,
        element: entry.example,
        staticName: staticInfo?.exampleNames[index],
      });
      return;
    }
    configuredProps.add(entry.prop);
    if (entry.disabled) return;
    examples.push({
      kind: "auto",
      title: entry.title ?? entry.prop,
      description: entry.description,
      prop: entry.prop,
      view: entry.view ?? "row",
      args: { ...defaultArgs, ...entry.defaultArgs },
    });
  });
  for (const row of rows) {
    if (configuredProps.has(row.name)) continue;
    examples.push({
      kind: "auto",
      title: row.name,
      prop: row.name,
      view: "row",
      args: { ...defaultArgs },
    });
  }

  const headings: TocHeading[] = [];
  const used = new Set<string>();
  const uniqueId = (text: string) => {
    const base = slugify(text);
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return id;
  };
  const addHeading = (text: string, level: number) => {
    const id = uniqueId(text);
    headings.push({ id, text, level });
    return id;
  };

  let anatomyId: string | undefined;
  let examplesId: string | undefined;
  if (meta.anatomy) anatomyId = addHeading(strings.anatomy, 2);
  const resolved: ResolvedExample[] = [];
  if (examples.length > 0) {
    examplesId = addHeading(strings.examples, 2);
    for (const example of examples) {
      resolved.push({
        ...example,
        id: addHeading(example.title, 3),
      } as ResolvedExample);
    }
  }
  const apiId = addHeading(strings.api, 2);

  return {
    title,
    headings,
    anatomyId,
    examplesId,
    apiId,
    examples: resolved,
    mainExampleName: staticInfo?.mainExampleName,
    source,
    displayName,
  };
}
