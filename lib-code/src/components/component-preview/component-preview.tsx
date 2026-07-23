import type { ReactNode } from "react";
import { CodeBlock, Preview } from "@tulls-md/tulldoc";
import type { ExampleView } from "../../shared/types";
import styles from "./component-preview.module.css";

interface ComponentPreviewProps {
  component: ReactNode;
  code: string;
  previewHeight?: number;
  view?: ExampleView;
  showCodeLabel?: string;
  hideCodeLabel?: string;
}

export async function ComponentPreview({
  component,
  code,
  previewHeight,
  view = "grid",
  showCodeLabel,
  hideCodeLabel,
}: ComponentPreviewProps) {
  return (
    <div className={styles.Root}>
      <Preview height={previewHeight} canvas={view !== "plain"}>
        {component}
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
