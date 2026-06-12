import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import type { ComponentType, ReactElement } from "react";
import type { Statement } from "@babel/types";
import { parseTsx } from "../ast/babel";

interface SourceIndex {
  byName: Map<string, string[]>;
  fileMtimes: Map<string, number>;
}

const indexCache = new Map<string, SourceIndex>();

function collectTsxFiles(dir: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectTsxFiles(path));
    } else if (entry.name.endsWith(".tsx")) {
      result.push(path);
    }
  }
  return result;
}

function isComponentName(name: string): boolean {
  return /^[A-Z]/.test(name);
}

/**
 * Имена top-level функций-компонентов файла, включая неэкспортированные
 * (части compound-компонентов попадают в экспорт через объект).
 */
function namesInFile(filePath: string): string[] {
  const ast = parseTsx(readFileSync(filePath, "utf-8"));
  const names = new Set<string>();
  const visit = (statement: Statement) => {
    if (
      statement.type === "ExportNamedDeclaration" ||
      statement.type === "ExportDefaultDeclaration"
    ) {
      if (
        statement.declaration &&
        statement.declaration.type !== "TSTypeAliasDeclaration"
      ) {
        visit(statement.declaration as Statement);
      }
      return;
    }
    if (statement.type === "FunctionDeclaration" && statement.id) {
      if (isComponentName(statement.id.name)) names.add(statement.id.name);
    }
    if (statement.type === "VariableDeclaration") {
      for (const declarator of statement.declarations) {
        if (
          declarator.id.type === "Identifier" &&
          isComponentName(declarator.id.name) &&
          declarator.init &&
          (declarator.init.type === "ArrowFunctionExpression" ||
            declarator.init.type === "FunctionExpression")
        ) {
          names.add(declarator.id.name);
        }
      }
    }
  };
  for (const statement of ast.program.body) visit(statement);
  return [...names];
}

function buildIndex(dir: string): SourceIndex {
  const byName = new Map<string, string[]>();
  const fileMtimes = new Map<string, number>();
  for (const filePath of collectTsxFiles(dir)) {
    fileMtimes.set(filePath, statSync(filePath).mtimeMs);
    for (const name of namesInFile(filePath)) {
      const files = byName.get(name);
      if (files) {
        files.push(filePath);
      } else {
        byName.set(name, [filePath]);
      }
    }
  }
  return { byName, fileMtimes };
}

function isFresh(dir: string, index: SourceIndex): boolean {
  const files = collectTsxFiles(dir);
  if (files.length !== index.fileMtimes.size) return false;
  return files.every((filePath) => {
    const mtime = index.fileMtimes.get(filePath);
    return mtime !== undefined && statSync(filePath).mtimeMs === mtime;
  });
}

export function getSourceIndex(dir: string): Map<string, string[]> {
  const cached = indexCache.get(dir);
  if (cached && isFresh(dir, cached)) return cached.byName;
  const index = buildIndex(dir);
  indexCache.set(dir, index);
  return index.byName;
}

function lookup(dir: string, name: string): string {
  // Точки в имени игнорируются: "Layout.Header" ищется как функция LayoutHeader
  const functionName = name.replaceAll(".", "");
  const files = getSourceIndex(dir).get(functionName);
  if (!files) {
    throw new Error(
      `tulldoc: компонент "${functionName}" не найден в ${dir}. ` +
        "Если имя функции потерялось (минификация, анонимная функция или обёртка), " +
        "задайте displayName или componentName в DocMeta.",
    );
  }
  if (files.length > 1) {
    throw new Error(
      `tulldoc: имя "${functionName}" найдено в нескольких файлах: ${files.join(", ")}`,
    );
  }
  return files[0];
}

function componentName(component: unknown): string | undefined {
  const candidate = component as { displayName?: string; name?: string };
  return candidate.displayName || candidate.name || undefined;
}

export function resolveComponentSource(
  dir: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- компонент с произвольными пропсами
  component: ComponentType<any>,
  nameOverride?: string,
): { filePath: string; exportName: string } {
  const name = nameOverride ?? componentName(component);
  if (!name) {
    throw new Error(
      "tulldoc: у компонента нет имени (анонимная функция или минификация) - задайте componentName в DocMeta",
    );
  }
  const exportName = name.replaceAll(".", "");
  return { filePath: lookup(dir, name), exportName };
}

export function resolveExampleSource(
  dir: string,
  element: ReactElement,
  nameOverride?: string,
): string {
  const name = nameOverride ?? componentName(element.type);
  if (!name) {
    throw new Error(
      "tulldoc: у компонента-примера нет имени (анонимная функция или минификация) - задайте displayName",
    );
  }
  return lookup(dir, name);
}
