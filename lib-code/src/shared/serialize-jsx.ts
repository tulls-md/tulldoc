import { Fragment, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

/** Имя компонента, переданного значением пропа (icon={HeartIcon} и т.п.) */
export function componentValueName(value: unknown): string | undefined {
  if (typeof value === "function" && value.name) return value.name;
  if (typeof value === "object" && value !== null) {
    const candidate = value as { displayName?: unknown };
    if (typeof candidate.displayName === "string" && candidate.displayName) {
      return candidate.displayName;
    }
  }
}

function unserializable(name: string): Error {
  return new Error(
    `tulldoc: значение пропа "${name}" нельзя сериализовать в код - поддерживаются string, number, boolean и именованные компоненты. Используйте ручной пример.`,
  );
}

/** Печать ReactNode (значения пропа или children) обратно в JSX-текст. */
export function serializeReactNode(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(serializeReactNode).join("");
  if (isValidElement(node)) return serializeReactElement(node);
  throw unserializable("children");
}

function serializeReactElement(element: ReactElement): string {
  const { type } = element;
  const props = element.props as { children?: ReactNode } & Record<
    string,
    unknown
  >;
  const { children, ...rest } = props;
  const attrs = serializeJsxAttrs(rest);

  if (type === Fragment) {
    return `<>${serializeReactNode(children)}</>`;
  }
  const tag = typeof type === "string" ? type : componentValueName(type);
  if (!tag) throw unserializable("children");

  const open = attrs ? `<${tag} ${attrs}` : `<${tag}`;
  const inner = serializeReactNode(children);
  return inner === "" ? `${open} />` : `${open}>${inner}</${tag}>`;
}

/** Сериализация пропсов в текст JSX-атрибутов для отображаемого кода примеров. */
export function serializeJsxAttrs(args: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [name, value] of Object.entries(args)) {
    if (value === undefined) continue;
    if (typeof value === "string") {
      parts.push(`${name}="${value.replaceAll('"', "&quot;")}"`);
    } else if (value === true) {
      parts.push(name);
    } else if (value === false) {
      parts.push(`${name}={false}`);
    } else if (typeof value === "number") {
      parts.push(`${name}={${value}}`);
    } else if (isValidElement(value)) {
      parts.push(`${name}={${serializeReactElement(value)}}`);
    } else {
      const componentName = componentValueName(value);
      if (!componentName) {
        throw unserializable(name);
      }
      parts.push(`${name}={${componentName}}`);
    }
  }
  return parts.join(" ");
}

export function serializeComponentJsx(
  name: string,
  args: Record<string, unknown>,
  children?: unknown,
): string {
  const attrs = serializeJsxAttrs(args);
  const open = attrs ? `<${name} ${attrs}` : `<${name}`;
  const inner = serializeReactNode(children as ReactNode);
  return inner === "" ? `${open} />` : `${open}>${inner}</${name}>`;
}
