import ts from "typescript";
import { createFileCache } from "../sources/file-cache";
import { getComponentParameter } from "./program";

export type PropValue = string | number | boolean;

/** boolean-проп приходит как union [true, false] - пара boolean-литералов. */
export function isBooleanPair(values: PropValue[]): boolean {
  return values.length === 2 && values.every((v) => typeof v === "boolean");
}

/**
 * values - тип перечислим (union литералов или boolean);
 * string/number - свободный примитив, перечислить нельзя, но значение
 * можно подставить; other - пример не сгенерировать, причина в reason.
 */
export type PropValueInfo =
  | { kind: "values"; values: PropValue[] }
  | { kind: "string" }
  | { kind: "number" }
  | { kind: "other"; reason: string };

function literalValue(
  type: ts.Type,
  checker: ts.TypeChecker,
): PropValue | undefined {
  if (type.isStringLiteral()) return type.value;
  if (type.isNumberLiteral()) return type.value;
  if (type.flags & ts.TypeFlags.BooleanLiteral) {
    return checker.typeToString(type) === "true";
  }
  return undefined;
}

const computeValueInfo = createFileCache(
  (
    filePath: string,
    exportName: string | undefined,
    propName: string,
  ): PropValueInfo => {
    const { checker, parameter } = getComponentParameter(filePath, exportName);
    if (!parameter) {
      return {
        kind: "other",
        reason: `компонент в ${filePath} не принимает пропсов`,
      };
    }
    const propsType = checker.getTypeAtLocation(parameter);
    const symbol = checker
      .getPropertiesOfType(propsType)
      .find((s) => s.name === propName);
    if (!symbol) {
      return {
        kind: "other",
        reason: `проп "${propName}" не найден у компонента в ${filePath}`,
      };
    }
    const propType = checker.getNonNullableType(
      checker.getTypeOfSymbolAtLocation(symbol, parameter),
    );

    if (propType.flags & ts.TypeFlags.String) return { kind: "string" };
    if (propType.flags & ts.TypeFlags.Number) return { kind: "number" };

    const members = propType.isUnion() ? propType.types : [propType];
    const values: PropValue[] = [];
    for (const member of members) {
      if (member.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) continue;
      if (member.flags & ts.TypeFlags.String) return { kind: "string" };
      if (member.flags & ts.TypeFlags.Number) return { kind: "number" };
      const value = literalValue(member, checker);
      if (value === undefined) {
        return {
          kind: "other",
          reason: `тип пропа "${propName}" (${checker.typeToString(propType)}) не является перечислением литералов`,
        };
      }
      values.push(value);
    }
    if (values.length === 0) {
      return {
        kind: "other",
        reason: `у пропа "${propName}" нет ни одного литерального значения`,
      };
    }
    return { kind: "values", values };
  },
  (filePath, exportName, propName) =>
    `${filePath}#${exportName ?? ""}#${propName}`,
);

/**
 * Что можно сгенерировать для пропа по его TS-типу. Тип берётся из первого
 * параметра компонента, `undefined` у optional-пропов отбрасывается.
 */
export function extractPropValueInfo({
  filePath,
  exportName,
  propName,
}: {
  filePath: string;
  exportName?: string;
  propName: string;
}): PropValueInfo {
  return computeValueInfo(filePath, exportName, propName);
}

/**
 * Список возможных значений пропа: union литералов или boolean.
 * Неперечислимый тип - ошибка.
 */
export function extractPropValues(options: {
  filePath: string;
  exportName?: string;
  propName: string;
}): PropValue[] {
  const info = extractPropValueInfo(options);
  if (info.kind === "values") return info.values;
  const reason =
    info.kind === "other"
      ? info.reason
      : `тип пропа "${options.propName}" (${info.kind}) не является перечислением литералов`;
  throw new Error(`ComponentExamples: ${reason}`);
}
