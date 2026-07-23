import { Fragment, type ReactNode } from "react";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import type { Parents, RootContent } from "mdast";
import styles from "./markdown.module.css";

interface MarkdownProps {
  /** Исходный markdown-текст */
  children: string;
  /** Карта текст-инлайн-кода -> href: `имя` с таким текстом становится ссылкой */
  codeLinks?: Record<string, string>;
}

/**
 * Рендерит markdown-строку в React без клиентского кода. Поддерживается
 * инлайн-разметка (код, жирный, курсив, зачёркнутый, ссылки) и списки;
 * заголовки и блоки кода деградируют до абзацев - описания не должны
 * ломать вёрстку таблиц и карточек.
 */
export function Markdown({ children, codeLinks }: MarkdownProps) {
  const tree = fromMarkdown(children, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  return <div className={styles.Root}>{renderChildren(tree, codeLinks)}</div>;
}

function renderChildren(
  parent: Parents,
  codeLinks: Record<string, string> | undefined,
): ReactNode[] {
  return parent.children.map((node, index) =>
    renderNode(node, codeLinks, index),
  );
}

function renderNode(
  node: RootContent,
  codeLinks: Record<string, string> | undefined,
  key: number,
): ReactNode {
  switch (node.type) {
    case "text":
      return node.value;
    case "paragraph":
      return <p key={key}>{renderChildren(node, codeLinks)}</p>;
    case "inlineCode": {
      const href = codeLinks?.[node.value];
      const code = <code>{node.value}</code>;
      return href ? (
        <a key={key} href={href}>
          {code}
        </a>
      ) : (
        <Fragment key={key}>{code}</Fragment>
      );
    }
    case "strong":
      return <strong key={key}>{renderChildren(node, codeLinks)}</strong>;
    case "emphasis":
      return <em key={key}>{renderChildren(node, codeLinks)}</em>;
    case "delete":
      return <del key={key}>{renderChildren(node, codeLinks)}</del>;
    case "link":
      return (
        <a key={key} href={node.url} title={node.title ?? undefined}>
          {renderChildren(node, codeLinks)}
        </a>
      );
    case "list":
      return node.ordered ? (
        <ol key={key} start={node.start ?? undefined}>
          {renderChildren(node, codeLinks)}
        </ol>
      ) : (
        <ul key={key}>{renderChildren(node, codeLinks)}</ul>
      );
    case "listItem":
      return <li key={key}>{renderChildren(node, codeLinks)}</li>;
    case "break":
      return <br key={key} />;
    // Деградация: заголовок - жирный абзац, блок кода - абзац с кодом
    case "heading":
      return (
        <p key={key}>
          <strong>{renderChildren(node, codeLinks)}</strong>
        </p>
      );
    case "code":
      return (
        <p key={key}>
          <code>{node.value}</code>
        </p>
      );
    case "blockquote":
      return <Fragment key={key}>{renderChildren(node, codeLinks)}</Fragment>;
    case "image":
      return node.alt ?? null;
    default:
      if ("children" in node) {
        return <Fragment key={key}>{renderChildren(node, codeLinks)}</Fragment>;
      }
      return "value" in node ? node.value : null;
  }
}
