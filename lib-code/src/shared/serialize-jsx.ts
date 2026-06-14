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
    } else {
      const componentName = componentValueName(value);
      if (!componentName) {
        throw new Error(
          `tulldoc: значение пропа "${name}" нельзя сериализовать в код - поддерживаются string, number, boolean и именованные компоненты. Используйте ручной пример.`,
        );
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
  if (children === undefined || children === null) return `${open} />`;
  if (typeof children !== "string") {
    throw new Error(
      "tulldoc: children для автогенерации кода должны быть строкой. Используйте ручной пример.",
    );
  }
  return `${open}>${children}</${name}>`;
}
