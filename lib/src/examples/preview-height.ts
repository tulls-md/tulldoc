import { readFileSync } from "fs";
import type { Statement } from "@babel/types";
import { parseTsx } from "../ast/babel";
import { createFileCache } from "../sources/file-cache";

/** export const previewHeight = <число> в example-файле */
export function isPreviewHeightExport(statement: Statement): boolean {
  return (
    statement.type === "ExportNamedDeclaration" &&
    statement.declaration?.type === "VariableDeclaration" &&
    statement.declaration.declarations.some(
      (declarator) =>
        declarator.id.type === "Identifier" &&
        declarator.id.name === "previewHeight",
    )
  );
}

/**
 * Высота превью, заданная примером: `export const previewHeight = 160`.
 * Нужна примерам, чей контент не имеет собственной высоты (position: fixed)
 * или, наоборот, занимает весь вьюпорт (100dvh) и требует обрезки.
 */
export const extractPreviewHeight = createFileCache(
  (filePath: string): number | undefined => {
    let result: number | undefined;
    const ast = parseTsx(readFileSync(filePath, "utf-8"));
    for (const statement of ast.program.body) {
      if (
        !isPreviewHeightExport(statement) ||
        statement.type !== "ExportNamedDeclaration"
      ) {
        continue;
      }
      if (statement.declaration?.type !== "VariableDeclaration") continue;
      for (const declarator of statement.declaration.declarations) {
        if (
          declarator.id.type === "Identifier" &&
          declarator.id.name === "previewHeight" &&
          declarator.init?.type === "NumericLiteral"
        ) {
          result = declarator.init.value;
        }
      }
    }
    return result;
  },
);
