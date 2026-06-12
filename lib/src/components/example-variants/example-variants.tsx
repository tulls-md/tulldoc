import type { ReactNode } from "react";
import clsx from "clsx";
import { CodeBlock } from "../code-block/code-block";
import { Preview } from "../preview/preview";
import type { ExampleView } from "../../shared/types";
import styles from "./example-variants.module.css";

interface ExampleVariant {
  label: string;
  content: ReactNode;
}

interface ExampleVariantsProps {
  variants: ExampleVariant[];
  view?: ExampleView;
  code: string;
  previewHeight?: number;
  showCodeLabel?: string;
  hideCodeLabel?: string;
}

export function ExampleVariants({
  variants,
  view = "row",
  code,
  previewHeight,
  showCodeLabel,
  hideCodeLabel,
}: ExampleVariantsProps) {
  return (
    <div className={styles.Root}>
      {view === "cell" ? (
        variants.map((variant) => (
          <Preview key={variant.label} height={previewHeight}>
            <div className={clsx(styles.Item, styles.Cell)}>
              <span className={styles.Label}>{variant.label}</span>
              {variant.content}
            </div>
          </Preview>
        ))
      ) : (
        <Preview height={previewHeight}>
          <div
            className={clsx(
              styles.Items,
              view === "row" ? styles.Row : styles.Grid,
            )}
          >
            {variants.map((variant) => (
              <div key={variant.label} className={styles.Item}>
                <span className={styles.Label}>{variant.label}</span>
                {variant.content}
              </div>
            ))}
          </div>
        </Preview>
      )}
      <CodeBlock
        lang="tsx"
        collapsible
        showLabel={showCodeLabel}
        hideLabel={hideCodeLabel}
      >
        {code}
      </CodeBlock>
    </div>
  );
}
