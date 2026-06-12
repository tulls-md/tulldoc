import { readFileSync } from "fs";
import type {
  Expression,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  ObjectExpression,
} from "@babel/types";
import { findDefaultExportFunction, parseTsx, walk } from "../ast/babel";
import { createFileCache } from "../sources/file-cache";

export interface DocStaticInfo {
  title?: string;
  description?: string;
  /** Имя компонента как написано в исходнике: "ButtonIcon", "Layout.Header" */
  componentName?: string;
  /** Имя JSX-элемента главного примера (mainExample) */
  mainExampleName?: string;
  /** Имена JSX-элементов ручных примеров по индексу в examples */
  exampleNames: (string | undefined)[];
}

function unwrap(expression: Expression): Expression {
  return expression.type === "ParenthesizedExpression"
    ? expression.expression
    : expression;
}

function literalText(expression: Expression): string | undefined {
  if (expression.type === "StringLiteral") return expression.value;
  if (
    expression.type === "TemplateLiteral" &&
    expression.expressions.length === 0
  ) {
    return expression.quasis[0]?.value.cooked;
  }
}

/** Текст ссылки на компонент: Identifier или цепочка MemberExpression */
function referenceText(expression: Expression): string | undefined {
  if (expression.type === "Identifier") return expression.name;
  if (
    expression.type === "MemberExpression" &&
    expression.property.type === "Identifier"
  ) {
    const objectText = referenceText(expression.object as Expression);
    return objectText ? `${objectText}.${expression.property.name}` : undefined;
  }
}

function jsxNameText(
  name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName,
): string | undefined {
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXMemberExpression") {
    const objectText = jsxNameText(name.object);
    return objectText ? `${objectText}.${name.property.name}` : undefined;
  }
}

/** Имя JSX-элемента: <LayoutBasicExample /> -> "LayoutBasicExample" */
function jsxElementName(node: Expression): string | undefined {
  if (node.type !== "JSXElement") return undefined;
  return jsxNameText(node.openingElement.name);
}

function objectProperty(
  object: ObjectExpression,
  key: string,
): Expression | undefined {
  for (const property of object.properties) {
    if (
      property.type === "ObjectProperty" &&
      property.key.type === "Identifier" &&
      property.key.name === key &&
      property.value.type !== "RestElement" &&
      !property.value.type.endsWith("Pattern")
    ) {
      return property.value as Expression;
    }
  }
}

function extractExampleNames(object: ObjectExpression): (string | undefined)[] {
  const examples = objectProperty(object, "examples");
  if (!examples || examples.type !== "ArrayExpression") return [];
  return examples.elements.map((element) => {
    if (!element || element.type !== "ObjectExpression") return undefined;
    const example = objectProperty(element, "example");
    if (!example) return undefined;
    const value = unwrap(example);
    return value.type === "JSXElement" ? jsxElementName(value) : undefined;
  });
}

/**
 * Статически читает мету из .doc.tsx - синхронный аналог frontmatter.
 * title/description работают только как строковые литералы; имена компонента
 * и ручных примеров берутся из текста исходника, поэтому не зависят от
 * минификации функций в продакшен-сборке.
 */
export const extractDocStrings = createFileCache(
  (filePath: string): DocStaticInfo => {
    const ast = parseTsx(readFileSync(filePath, "utf-8"));
    const exported = findDefaultExportFunction(ast);
    const result: DocStaticInfo = { exampleNames: [] };
    if (exported) {
      let object: ObjectExpression | undefined;
      walk(exported.fn.body, (node) => {
        if (object) return;
        if (node.type === "ReturnStatement" && node.argument) {
          const argument = unwrap(node.argument);
          if (argument.type === "ObjectExpression") object = argument;
        }
      });
      if (!object && exported.fn.type === "ArrowFunctionExpression") {
        const body = exported.fn.body;
        if (body.type !== "BlockStatement") {
          const expression = unwrap(body);
          if (expression.type === "ObjectExpression") object = expression;
        }
      }
      if (object) {
        const title = objectProperty(object, "title");
        const description = objectProperty(object, "description");
        const component = objectProperty(object, "component");
        const mainExample = objectProperty(object, "mainExample");
        if (title) result.title = literalText(unwrap(title));
        if (description) result.description = literalText(unwrap(description));
        if (component) result.componentName = referenceText(unwrap(component));
        if (mainExample)
          result.mainExampleName = jsxElementName(unwrap(mainExample));
        result.exampleNames = extractExampleNames(object);
      }
    }
    return result;
  },
);
