import { statSync } from "fs";
import ts from "typescript";

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2023,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  allowImportingTsExtensions: true,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
};

const rootNames = new Set<string>();
const mtimes = new Map<string, number>();
let program: ts.Program | undefined;

function getProgram(filePath: string): ts.Program {
  if (!program || !rootNames.has(filePath)) {
    rootNames.add(filePath);
    program = ts.createProgram({
      rootNames: [...rootNames],
      options: compilerOptions,
      oldProgram: program,
    });
  }
  return program;
}

type ComponentNode =
  | ts.FunctionDeclaration
  | ts.ArrowFunction
  | ts.FunctionExpression;

function findDefaultComponent(
  sourceFile: ts.SourceFile,
): ComponentNode | undefined {
  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      ts.getCombinedModifierFlags(statement) & ts.ModifierFlags.Default
    ) {
      return statement;
    }
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      const expression = statement.expression;
      if (ts.isIdentifier(expression))
        return findComponent(sourceFile, expression.text);
      if (
        ts.isArrowFunction(expression) ||
        ts.isFunctionExpression(expression)
      ) {
        return expression;
      }
    }
  }
}

function findComponent(
  sourceFile: ts.SourceFile,
  exportName: string,
): ComponentNode | undefined {
  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === exportName
    ) {
      return statement;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === exportName &&
          declaration.initializer &&
          (ts.isArrowFunction(declaration.initializer) ||
            ts.isFunctionExpression(declaration.initializer))
        ) {
          return declaration.initializer;
        }
      }
    }
  }
}

/**
 * Первый параметр функции-компонента вместе с checker'ом инкрементальной
 * TS-программы. Программа пересоздаётся при изменении файла (mtime).
 */
export function getComponentParameter(
  filePath: string,
  exportName: string | undefined,
): {
  checker: ts.TypeChecker;
  sourceFile: ts.SourceFile;
  parameter?: ts.ParameterDeclaration;
} {
  const mtime = statSync(filePath).mtimeMs;
  const previousMtime = mtimes.get(filePath);
  if (previousMtime !== undefined && previousMtime !== mtime) {
    program = undefined;
  }
  mtimes.set(filePath, mtime);

  const sourceFile = getProgram(filePath).getSourceFile(filePath);
  if (!sourceFile) {
    throw new Error(`tulldoc: файл не найден: ${filePath}`);
  }
  const component = exportName
    ? findComponent(sourceFile, exportName)
    : findDefaultComponent(sourceFile);
  if (!component) {
    throw new Error(
      exportName
        ? `tulldoc: компонент "${exportName}" не найден в ${filePath}`
        : `tulldoc: default-экспорт компонента не найден в ${filePath}`,
    );
  }

  const checker = getProgram(filePath).getTypeChecker();
  return { checker, sourceFile, parameter: component.parameters[0] };
}
