import { existsSync, readFileSync } from "fs";
import { dirname, resolve, sep } from "path";
import type { ImportDeclaration } from "@babel/types";
import {
  applyEdits,
  parseTsx,
  walk,
  extractReturnedJsx,
  type Edit,
} from "../ast/babel";
import { isPreviewHeightExport } from "./preview-height";

interface NestedExample {
  localName: string;
  importNode: ImportDeclaration;
  jsx: string;
  imports: ImportDeclaration[];
  source: string;
}

function resolveExampleImport(
  node: ImportDeclaration,
  fileDir: string,
  examplesDir: string,
): string | undefined {
  const specifier = node.source.value;
  if (!specifier.startsWith(".")) return undefined;
  const filePath = resolve(fileDir, `${specifier}.tsx`);
  if (!filePath.startsWith(resolve(examplesDir) + sep)) return undefined;
  if (!existsSync(filePath)) return undefined;
  return filePath;
}

function lineIndent(source: string, offset: number): string {
  const lineStart = source.lastIndexOf("\n", offset - 1) + 1;
  const prefix = source.slice(lineStart, offset);
  return /^[ \t]*$/.test(prefix) ? prefix : "";
}

function reindent(snippet: string, indent: string): string {
  const lines = snippet.split("\n");
  if (lines.length === 1) return snippet;
  const rest = lines.slice(1).filter((line) => line.trim() !== "");
  const minIndent = Math.min(
    ...rest.map((line) => line.match(/^[ \t]*/)![0].length),
  );
  return [
    lines[0],
    ...lines
      .slice(1)
      .map((line) =>
        line.trim() === "" ? "" : indent + line.slice(minIndent),
      ),
  ].join("\n");
}

interface ImportSpec {
  defaultName?: string;
  named: Set<string>;
  raw: ImportDeclaration;
}

function specifiersOf(node: ImportDeclaration): ImportSpec {
  const spec: ImportSpec = { named: new Set(), raw: node };
  for (const s of node.specifiers) {
    if (s.type === "ImportDefaultSpecifier") {
      spec.defaultName = s.local.name;
    } else if (s.type === "ImportSpecifier") {
      const imported =
        s.imported.type === "Identifier" ? s.imported.name : s.imported.value;
      spec.named.add(
        imported === s.local.name ? imported : `${imported} as ${s.local.name}`,
      );
    }
  }
  return spec;
}

function printImport(source: string, spec: ImportSpec): string {
  const parts: string[] = [];
  if (spec.defaultName) parts.push(spec.defaultName);
  if (spec.named.size > 0)
    parts.push(`{ ${[...spec.named].sort().join(", ")} }`);
  return `import ${parts.join(", ")} from "${source}";`;
}

/**
 * Читает исходник примера и «разворачивает» использования других примеров:
 * импортированные из examplesDir компоненты заменяются их JSX, а импорты
 * объединяются - как будто всё написано в одном файле. Рендер компонента
 * это не затрагивает, только отображаемый код.
 */
export function flattenExampleCode(
  filePath: string,
  examplesDir: string,
  seen: Set<string> = new Set(),
): string {
  const absolutePath = resolve(filePath);
  if (seen.has(absolutePath)) {
    throw new Error(`Циклический импорт примеров: ${absolutePath}`);
  }
  seen.add(absolutePath);

  const source = readFileSync(absolutePath, "utf-8");
  const ast = parseTsx(source);
  const fileDir = dirname(absolutePath);

  const hostImports: ImportDeclaration[] = [];
  const nested: NestedExample[] = [];
  for (const statement of ast.program.body) {
    if (statement.type !== "ImportDeclaration") continue;
    const nestedPath = resolveExampleImport(statement, fileDir, examplesDir);
    const defaultSpecifier = statement.specifiers.find(
      (s) => s.type === "ImportDefaultSpecifier",
    );
    if (!nestedPath || !defaultSpecifier) {
      hostImports.push(statement);
      continue;
    }
    const nestedSource = flattenExampleCode(nestedPath, examplesDir, seen);
    const nestedAst = parseTsx(nestedSource);
    nested.push({
      localName: defaultSpecifier.local.name,
      importNode: statement,
      jsx: extractReturnedJsx(nestedAst, nestedSource, nestedPath),
      imports: nestedAst.program.body.filter(
        (s): s is ImportDeclaration => s.type === "ImportDeclaration",
      ),
      source: nestedSource,
    });
  }
  seen.delete(absolutePath);

  // export const previewHeight - служебная мета примера, в коде не показывается
  const edits: Edit[] = [];
  for (const statement of ast.program.body) {
    if (!isPreviewHeightExport(statement)) continue;
    const start =
      source[statement.start! - 1] === "\n" &&
      source[statement.start! - 2] === "\n"
        ? statement.start! - 1
        : statement.start!;
    const end =
      source[statement.end!] === "\n" ? statement.end! + 1 : statement.end!;
    edits.push({ start, end, replacement: "" });
  }

  if (nested.length === 0) return applyEdits(source, edits);

  for (const example of nested) {
    const importEnd =
      source[example.importNode.end!] === "\n"
        ? example.importNode.end! + 1
        : example.importNode.end!;
    edits.push({
      start: example.importNode.start!,
      end: importEnd,
      replacement: "",
    });

    walk(ast.program, (node) => {
      if (node.type !== "JSXElement") return;
      const name = node.openingElement.name;
      if (name.type !== "JSXIdentifier" || name.name !== example.localName)
        return;
      if (node.openingElement.attributes.length > 0) {
        throw new Error(
          `Пример <${example.localName}> используется с пропами - разворачивание поддерживает только <${example.localName} />`,
        );
      }
      if (
        node.children.some((c) => c.type !== "JSXText" || c.value.trim() !== "")
      ) {
        throw new Error(
          `Пример <${example.localName}> используется с children - разворачивание поддерживает только <${example.localName} />`,
        );
      }
      edits.push({
        start: node.start!,
        end: node.end!,
        replacement: reindent(example.jsx, lineIndent(source, node.start!)),
      });
    });
  }

  // Слияние импортов вложенных примеров с импортами хоста
  const merged = new Map<string, ImportSpec>();
  for (const example of nested) {
    for (const node of example.imports) {
      const moduleSource = node.source.value;
      const incoming = specifiersOf(node);
      const existing = merged.get(moduleSource);
      if (existing) {
        for (const name of incoming.named) existing.named.add(name);
        existing.defaultName ??= incoming.defaultName;
      } else {
        merged.set(moduleSource, incoming);
      }
    }
  }

  const lastHostImport = hostImports[hostImports.length - 1];
  const additions: string[] = [];
  for (const [moduleSource, incoming] of merged) {
    const host = hostImports.find((node) => node.source.value === moduleSource);
    if (host) {
      const spec = specifiersOf(host);
      const before = spec.defaultName + [...spec.named].sort().join(",");
      for (const name of incoming.named) spec.named.add(name);
      spec.defaultName ??= incoming.defaultName;
      const after = spec.defaultName + [...spec.named].sort().join(",");
      if (before !== after) {
        edits.push({
          start: host.start!,
          end: host.end!,
          replacement: printImport(moduleSource, spec),
        });
      }
    } else {
      additions.push(printImport(moduleSource, incoming));
    }
  }
  if (additions.length > 0 && lastHostImport) {
    edits.push({
      start: lastHostImport.end!,
      end: lastHostImport.end!,
      replacement: `\n${additions.join("\n")}`,
    });
  } else if (additions.length > 0) {
    edits.push({
      start: 0,
      end: 0,
      replacement: `${additions.join("\n")}\n\n`,
    });
  }

  return applyEdits(source, edits);
}
