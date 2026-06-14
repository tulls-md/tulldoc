import type { ReactNode } from "react";
import { CodeBlock, Preview } from "@tulls-md/tulldoc";
import styles from "./component-preview.module.css";

interface ComponentPreviewProps {
  component: ReactNode;
  code: string;
  previewHeight?: number;
  showCodeLabel?: string;
  hideCodeLabel?: string;
}

export async function ComponentPreview({
  component,
  code,
  previewHeight,
  showCodeLabel,
  hideCodeLabel,
}: ComponentPreviewProps) {
  return (
    <div className={styles.Root}>
      <Preview height={previewHeight}>{component}</Preview>
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
