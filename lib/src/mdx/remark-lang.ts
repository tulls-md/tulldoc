/**
 * Remark-плагин: превращает контейнер-директивы `:::lang{xx}` в JSX-элементы
 * `<LangBlock locale="xx">…</LangBlock>` и группирует подряд идущие в один
 * `<LangSwitch>`. Выбор языка делает LangSwitch на рендере (см. lang-block.tsx),
 * поэтому в дереве остаются обе версии, а на странице показывается одна.
 *
 * Используется как строковый плагин MDX: "@tulls-md/tulldoc/remark-lang",
 * поэтому не должен импортировать React или серверный код.
 */

interface UnistNode {
  type: string;
  children?: UnistNode[];
  [key: string]: unknown;
}

interface ContainerDirective extends UnistNode {
  type: "containerDirective";
  name: string;
  attributes?: Record<string, string | null>;
  children: UnistNode[];
}

const DIRECTIVE_NAME = "lang";

function isLangDirective(node: UnistNode): node is ContainerDirective {
  return node.type === "containerDirective" && node.name === DIRECTIVE_NAME;
}

/** Локаль из `:::lang{en}` - первый ключ атрибутов директивы */
function localeOf(node: ContainerDirective): string {
  const attributes = node.attributes ?? {};
  return Object.keys(attributes)[0] ?? "";
}

function toLangBlock(node: ContainerDirective): UnistNode {
  return {
    type: "mdxJsxFlowElement",
    name: "LangBlock",
    attributes: [
      { type: "mdxJsxAttribute", name: "locale", value: localeOf(node) },
    ],
    children: node.children,
  };
}

function transformChildren(children: UnistNode[]): UnistNode[] {
  const result: UnistNode[] = [];
  let i = 0;
  while (i < children.length) {
    const child = children[i];
    if (isLangDirective(child)) {
      const blocks: UnistNode[] = [];
      while (i < children.length && isLangDirective(children[i])) {
        blocks.push(toLangBlock(children[i] as ContainerDirective));
        i++;
      }
      result.push({
        type: "mdxJsxFlowElement",
        name: "LangSwitch",
        attributes: [],
        children: blocks,
      });
      continue;
    }
    if (child.children) child.children = transformChildren(child.children);
    result.push(child);
    i++;
  }
  return result;
}

export default function remarkLang() {
  return (tree: UnistNode): void => {
    if (tree.children) tree.children = transformChildren(tree.children);
  };
}
