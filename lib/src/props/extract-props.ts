import ts from "typescript";
import type { ComponentPropsInfo, PropRow } from "../shared/types";
import { createFileCache } from "../sources/file-cache";
import { getComponentParameter } from "./program";

/**
 * Текст типа пропа как он объявлен в исходнике. Неэкспортированный type alias
 * из исходников проекта (внутренняя деталь, читатель не может на него
 * сослаться) разворачивается на один уровень в его правую часть. Алиасы из
 * node_modules (например React.ReactNode) остаются по имени.
 */
function propTypeText(
  declaration: ts.PropertySignature,
  checker: ts.TypeChecker,
): string {
  const typeNode = declaration.type;
  if (!typeNode) return "unknown";
  let text = typeNode.getText();
  if (ts.isTypeReferenceNode(typeNode)) {
    let symbol = checker.getSymbolAtLocation(typeNode.typeName);
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) {
      symbol = checker.getAliasedSymbol(symbol);
    }
    const aliasDeclaration = symbol?.declarations?.find(
      ts.isTypeAliasDeclaration,
    );
    if (
      aliasDeclaration &&
      !aliasDeclaration.getSourceFile().fileName.includes("node_modules") &&
      !aliasDeclaration.getSourceFile().isDeclarationFile &&
      !(ts.getCombinedModifierFlags(aliasDeclaration) & ts.ModifierFlags.Export)
    ) {
      text = aliasDeclaration.type.getText();
    }
  }
  return text.replace(/\bReact\./g, "").replace(/\s+/g, " ");
}

function collectDefaults(
  parameter: ts.ParameterDeclaration,
): Map<string, string> {
  const defaults = new Map<string, string>();
  if (!ts.isObjectBindingPattern(parameter.name)) return defaults;
  for (const element of parameter.name.elements) {
    if (!element.initializer) continue;
    const nameNode = element.propertyName ?? element.name;
    if (ts.isIdentifier(nameNode)) {
      defaults.set(nameNode.text, element.initializer.getText());
    }
  }
  return defaults;
}

/** Тип объявлен в node_modules или .d.ts - не в исходниках проекта */
function isExternalDeclaration(declaration: ts.Declaration): boolean {
  const file = declaration.getSourceFile();
  return file.fileName.includes("node_modules") || file.isDeclarationFile;
}

/**
 * Текст внешних базовых типов props-типа: extends у интерфейсов и члены
 * пересечений, объявленные вне проекта (например React.HTMLProps<...>).
 * Базы из исходников проекта раскрываются рекурсивно - их собственные
 * пропсы и так попадают в таблицу построчно.
 */
function inheritedTypeTexts(
  typeNode: ts.TypeNode | undefined,
  checker: ts.TypeChecker,
  seen: Set<ts.Declaration> = new Set(),
): string[] {
  if (!typeNode) return [];
  if (ts.isIntersectionTypeNode(typeNode)) {
    return typeNode.types.flatMap((node) =>
      inheritedTypeTexts(node, checker, seen),
    );
  }
  if (
    !ts.isTypeReferenceNode(typeNode) &&
    !ts.isExpressionWithTypeArguments(typeNode)
  ) {
    return [];
  }
  const nameNode = ts.isTypeReferenceNode(typeNode)
    ? typeNode.typeName
    : typeNode.expression;
  let symbol = checker.getSymbolAtLocation(nameNode);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) {
    symbol = checker.getAliasedSymbol(symbol);
  }
  const declarations = symbol?.declarations ?? [];
  const projectDeclarations = declarations.filter(
    (declaration) => !isExternalDeclaration(declaration),
  );
  if (declarations.length > 0 && projectDeclarations.length === 0) {
    return [typeNode.getText().replace(/\s+/g, " ")];
  }
  const result: string[] = [];
  for (const declaration of projectDeclarations) {
    if (seen.has(declaration)) continue;
    seen.add(declaration);
    if (ts.isInterfaceDeclaration(declaration)) {
      for (const clause of declaration.heritageClauses ?? []) {
        for (const node of clause.types) {
          result.push(...inheritedTypeTexts(node, checker, seen));
        }
      }
    } else if (ts.isTypeAliasDeclaration(declaration)) {
      result.push(...inheritedTypeTexts(declaration.type, checker, seen));
    }
  }
  return result;
}

const computeProps = createFileCache(
  (filePath: string, exportName: string): ComponentPropsInfo => {
    const { checker, sourceFile, parameter } = getComponentParameter(
      filePath,
      exportName,
    );
    if (!parameter) return { rows: [], inheritedFrom: [] };

    const defaults = collectDefaults(parameter);
    const propsType = checker.getTypeAtLocation(parameter);

    // Пропсы из внешних типов (node_modules/.d.ts) не перечисляются построчно -
    // их базы попадают одной записью в inheritedFrom
    const own: PropRow[] = [];
    const fromProject: PropRow[] = [];
    for (const symbol of checker.getPropertiesOfType(propsType)) {
      const declaration = symbol.declarations?.find(ts.isPropertySignature);
      if (!declaration || isExternalDeclaration(declaration)) continue;
      const row: PropRow = {
        name: symbol.name,
        type: propTypeText(declaration, checker),
        required: !declaration.questionToken,
        defaultValue: defaults.get(symbol.name),
        description:
          ts.displayPartsToString(symbol.getDocumentationComment(checker)) ||
          undefined,
      };
      if (declaration.getSourceFile().fileName === sourceFile.fileName) {
        own.push(row);
      } else {
        fromProject.push(row);
      }
    }

    const inheritedFrom = [
      ...new Set(inheritedTypeTexts(parameter.type, checker)),
    ];
    return { rows: [...own, ...fromProject], inheritedFrom };
  },
  (filePath, exportName) => `${filePath}#${exportName}`,
);

export function extractComponentProps({
  filePath,
  exportName,
}: {
  filePath: string;
  exportName: string;
}): ComponentPropsInfo {
  return computeProps(filePath, exportName);
}
