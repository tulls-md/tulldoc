import { codeToHtml } from "shiki";
import { CodeBlockCollapse } from "./code-block-collapse";
import styles from "./code-block.module.css";

interface CodeBlockProps {
  children: string;
  lang?: string;
  /** Свернуть код за кнопкой «Посмотреть код» */
  collapsible?: boolean;
  showLabel?: string;
  hideLabel?: string;
}

export async function CodeBlock({
  children,
  lang = "text",
  collapsible = false,
  showLabel = "View code",
  hideLabel = "Hide code",
}: CodeBlockProps) {
  const html = await codeToHtml(children.trimEnd(), {
    lang,
    theme: "github-light",
    transformers: [
      {
        pre(node) {
          if (typeof node.properties.style === "string") {
            node.properties.style = node.properties.style
              .replace(/background-color:[^;]+;?\s*/g, "")
              .trim();
          }
        },
      },
    ],
  });

  const code = <div dangerouslySetInnerHTML={{ __html: html }} />;

  return (
    <div className={styles.Root}>
      {collapsible ? (
        <CodeBlockCollapse showLabel={showLabel} hideLabel={hideLabel}>
          {code}
        </CodeBlockCollapse>
      ) : (
        code
      )}
    </div>
  );
}
