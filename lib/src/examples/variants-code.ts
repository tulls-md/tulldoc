import { readFileSync } from "fs";
import { dirname, resolve, sep } from "path";
import type { ImportDeclaration, JSXElement, JSXFragment } from "@babel/types";
import {
  applyEdits,
  findDefaultExportFunction,
  parseTsx,
  walk,
  type Edit,
  type ExportedFunction,
} from "../ast/babel";
import type { PropValue } from "../props/prop-values";
import { serializeJsxAttrs } from "../shared/serialize-jsx";

function findReturnedJsx(
  fn: ExportedFunction,
): JSXElement | JSXFragment | undefined {
  let jsx: JSXElement | JSXFragment | undefined;
  walk(fn, (node) => {
    if (jsx) return;
    if (node.type === "ReturnStatement" && node.argument) {
      const argument =
        node.argument.type === "ParenthesizedExpression"
          ? node.argument.expression
          : node.argument;
      if (argument.type === "JSXElement" || argument.type === "JSXFragment") {
        jsx = argument;
      }
    }
  });
  if (!jsx && fn.type === "ArrowFunctionExpression") {
    const body =
      fn.body.type === "ParenthesizedExpression" ? fn.body.expression : fn.body;
    if (body.type === "JSXElement" || body.type === "JSXFragment") jsx = body;
  }
  return jsx;
}

function dedent(snippet: string): string {
  const lines = snippet.split("\n");
  if (lines.length === 1) return snippet;
  const rest = lines.slice(1).filter((line) => line.trim() !== "");
  if (rest.length === 0) return snippet;
  const minIndent = Math.min(
    ...rest.map((line) => line.match(/^[ \t]*/)![0].length),
  );
  return [
    lines[0],
    ...lines
      .slice(1)
      .map((line) => (line.trim() === "" ? "" : line.slice(minIndent))),
  ].join("\n");
}

function printValueImports(
  node: ImportDeclaration,
  source: string,
): string | undefined {
  if (node.importKind === "type") return undefined;
  const valueSpecifiers = node.specifiers.filter(
    (s) => !(s.type === "ImportSpecifier" && s.importKind === "type"),
  );
  if (valueSpecifiers.length === 0) return undefined;
  if (valueSpecifiers.length === node.specifiers.length) {
    return source.slice(node.start!, node.end!);
  }
  const parts: string[] = [];
  const named: string[] = [];
  for (const s of valueSpecifiers) {
    if (s.type === "ImportDefaultSpecifier") parts.push(s.local.name);
    if (s.type === "ImportNamespaceSpecifier")
      parts.push(`* as ${s.local.name}`);
    if (s.type === "ImportSpecifier") {
      const imported =
        s.imported.type === "Identifier" ? s.imported.name : s.imported.value;
      named.push(
        imported === s.local.name ? imported : `${imported} as ${s.local.name}`,
      );
    }
  }
  if (named.length > 0) parts.push(`{ ${named.join(", ")} }`);
  return `import ${parts.join(", ")} from "${node.source.value}";`;
}

/**
 * Строит отображаемый код для ComponentExamples: из example-файла, который
 * прокидывает props через {...props}, генерирует по одному JSX-блоку на каждое
 * значение пропа, подставляя явные атрибуты вместо спреда. Type-импорты
 * (тип пропсов нужен только примеру) в код не попадают.
 */
export function generateVariantsCode({
  filePath,
  examplesDir,
  prop,
  values,
  defaultArgs = {},
}: {
  filePath: string;
  examplesDir: string;
  prop: string;
  values: PropValue[];
  defaultArgs?: Record<string, unknown>;
}): string {
  const source = readFileSync(filePath, "utf-8");
  const ast = parseTsx(source);

  const exported = findDefaultExportFunction(ast);
  if (!exported) {
    throw new Error(
      `ComponentExamples: в ${filePath} не найден default-экспорт функции-примера`,
    );
  }
  const parameter = exported.fn.params[0];
  if (!parameter || parameter.type !== "Identifier") {
    throw new Error(
      `ComponentExamples: пример ${filePath} должен принимать пропсы одним параметром (props), без деструктуризации`,
    );
  }
  const paramName = parameter.name;

  const jsx = findReturnedJsx(exported.fn);
  if (!jsx) {
    throw new Error(
      `ComponentExamples: пример ${filePath} должен возвращать JSX`,
    );
  }

  const spreads: { start: number; end: number }[] = [];
  walk(jsx, (node) => {
    if (
      node.type === "JSXSpreadAttribute" &&
      node.argument.type === "Identifier" &&
      node.argument.name === paramName
    ) {
      spreads.push({ start: node.start!, end: node.end! });
    }
  });
  if (spreads.length === 0) {
    throw new Error(
      `ComponentExamples: в примере ${filePath} не найден {...${paramName}} - нечего заменять`,
    );
  }

  const snippetStart = jsx.start!;
  const snippet = source.slice(snippetStart, jsx.end!);

  const blocks = values.map((value) => {
    const attrs = serializeJsxAttrs({ ...defaultArgs, [prop]: value });
    const edits: Edit[] = spreads.map(({ start, end }) => {
      let editStart = start - snippetStart;
      const editEnd = end - snippetStart;
      if (attrs === "") {
        while (editStart > 0 && /[ \t]/.test(snippet[editStart - 1]))
          editStart--;
      }
      return { start: editStart, end: editEnd, replacement: attrs };
    });
    return dedent(applyEdits(snippet, edits));
  });

  const fileDir = dirname(filePath);
  const imports: string[] = [];
  for (const statement of ast.program.body) {
    if (statement.type !== "ImportDeclaration") continue;
    const specifier = statement.source.value;
    if (specifier.startsWith(".")) {
      const importPath = resolve(fileDir, `${specifier}.tsx`);
      if (importPath.startsWith(resolve(examplesDir) + sep)) {
        throw new Error(
          `ComponentExamples: пример ${filePath} импортирует другой пример (${specifier}) - вложенные примеры не поддерживаются`,
        );
      }
    }
    const printed = printValueImports(statement, source);
    if (printed) imports.push(printed);
  }

  const multiline = blocks.some((block) => block.includes("\n"));
  const body = blocks.join(multiline ? "\n\n" : "\n");
  return imports.length > 0 ? `${imports.join("\n")}\n\n${body}` : body;
}
