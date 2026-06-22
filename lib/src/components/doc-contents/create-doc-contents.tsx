import type { TulldocPlugin } from "../../doc/plugin";
import { DocTree, type DocTreeProps } from "./doc-tree";
import { DocCards, type DocCardsProps } from "./doc-cards";

/**
 * Создаёт MDX-компоненты содержания, привязанные к каталогу контента.
 * Подключается в mdx-components.tsx по аналогии с createComponentExamples:
 *
 *   const { DocTree, DocCards } = createDocContents(join(process.cwd(), "src/content"));
 *   return getMDXComponents({ DocTree, DocCards });
 */
export function createDocContents(
  contentDir: string,
  plugins?: TulldocPlugin[],
) {
  return {
    DocTree: (props: DocTreeProps) => (
      <DocTree {...props} contentDir={contentDir} plugins={plugins} />
    ),
    DocCards: (props: DocCardsProps) => (
      <DocCards {...props} contentDir={contentDir} plugins={plugins} />
    ),
  };
}
