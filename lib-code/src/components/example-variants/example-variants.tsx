import type { ReactNode } from "react";
import clsx from "clsx";
import { CodeBlock, Preview } from "@tulls-md/tulldoc";
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
  view = "grid",
  code,
  previewHeight,
  showCodeLabel,
  hideCodeLabel,
}: ExampleVariantsProps) {
  const showLabels = variants.length > 1;
  return (
    <div className={styles.Root}>
      <Preview height={previewHeight}>
        <div
          className={clsx(
            styles.Items,
            view === "cell" ? styles.Cell : styles.Grid,
            variants.length === 1 && styles.Single,
          )}
        >
          {variants.map((variant) => (
            <div key={variant.label} className={styles.Item}>
              {showLabels && (
                <span className={styles.Label}>{variant.label}</span>
              )}
              {variant.content}
            </div>
          ))}
        </div>
      </Preview>
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
