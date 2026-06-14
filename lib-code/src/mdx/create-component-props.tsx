import { basename, join } from "path";
import { PropsTable } from "../components/props-table/props-table";
import { extractComponentProps } from "../props/extract-props";
import { getDocStrings } from "@tulls-md/tulldoc";

function pascalCase(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function createComponentProps(componentsDir: string, lang?: string) {
  const strings = getDocStrings(lang);
  return async function AppComponentProps({
    src,
    name,
  }: {
    src: string;
    name?: string;
  }) {
    const filePath = join(componentsDir, `${src}.tsx`);
    const exportName = name ?? pascalCase(basename(src));
    return (
      <PropsTable
        {...extractComponentProps({ filePath, exportName })}
        emptyText={strings.noProps}
        requiredLabel={strings.required}
        inheritedFromLabel={strings.inheritedFrom}
      />
    );
  };
}
