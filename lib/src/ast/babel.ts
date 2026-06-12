import { parse } from "@babel/parser";
import type {
  ArrowFunctionExpression,
  File,
  FunctionDeclaration,
  FunctionExpression,
  JSXElement,
  JSXFragment,
  Node,
} from "@babel/types";

export interface Edit {
  start: number;
  end: number;
  replacement: string;
}

export function parseTsx(source: string): File {
  return parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
}

export function walk(node: unknown, visit: (node: Node) => void): void {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (!node || typeof node !== "object") return;
  const n = node as Node;
  if (typeof n.type !== "string") return;
  visit(n);
  for (const [key, value] of Object.entries(n)) {
    if (key === "loc") continue;
    walk(value, visit);
  }
}

export function applyEdits(source: string, edits: Edit[]): string {
  let result = source;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
    result =
      result.slice(0, edit.start) + edit.replacement + result.slice(edit.end);
  }
  return result;
}

export function extractReturnedJsx(
  ast: File,
  source: string,
  filePath: string,
): string {
  for (const statement of ast.program.body) {
    if (statement.type !== "ExportDefaultDeclaration") continue;
    let jsx: JSXElement | JSXFragment | undefined;
    walk(statement, (node) => {
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
    if (!jsx) break;
    return source.slice(jsx.start!, jsx.end!);
  }
  throw new Error(
    `Вложенный пример ${filePath} должен иметь default-экспорт функции, возвращающей JSX`,
  );
}

export type ExportedFunction =
  | FunctionDeclaration
  | ArrowFunctionExpression
  | FunctionExpression;

function findTopLevelFunction(
  ast: File,
  name: string,
): ExportedFunction | undefined {
  for (const statement of ast.program.body) {
    const declaration =
      statement.type === "ExportNamedDeclaration"
        ? statement.declaration
        : statement;
    if (!declaration) continue;
    if (
      declaration.type === "FunctionDeclaration" &&
      declaration.id?.name === name
    ) {
      return declaration;
    }
    if (declaration.type === "VariableDeclaration") {
      for (const declarator of declaration.declarations) {
        if (
          declarator.id.type === "Identifier" &&
          declarator.id.name === name &&
          declarator.init &&
          (declarator.init.type === "ArrowFunctionExpression" ||
            declarator.init.type === "FunctionExpression")
        ) {
          return declarator.init;
        }
      }
    }
  }
}

export function findDefaultExportFunction(
  ast: File,
): { fn: ExportedFunction; name?: string } | undefined {
  for (const statement of ast.program.body) {
    if (statement.type !== "ExportDefaultDeclaration") continue;
    const declaration = statement.declaration;
    if (declaration.type === "FunctionDeclaration") {
      return { fn: declaration, name: declaration.id?.name };
    }
    if (
      declaration.type === "ArrowFunctionExpression" ||
      declaration.type === "FunctionExpression"
    ) {
      return { fn: declaration };
    }
    if (declaration.type === "Identifier") {
      const fn = findTopLevelFunction(ast, declaration.name);
      if (fn) return { fn, name: declaration.name };
    }
  }
}
