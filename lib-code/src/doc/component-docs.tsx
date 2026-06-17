import type { ComponentType } from "react";
import type { ContentFile, DocStrings, TulldocPlugin } from "@tulls-md/tulldoc";
import {
  buildSourceUrl,
  findGitRoot,
  type RepoConfig,
} from "@tulls-md/tulldoc/server";
import { buildDocModel } from "./build-model";
import { DocContent } from "./doc-content";
import type { DocMeta } from "./doc-meta";
import { extractDocStrings } from "./static-info";

interface ComponentDocsOptions {
  /** Импорт .doc.tsx-документов из contentDir */
  importDoc: (
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- документ описывает компонент с произвольными пропсами
  ) => Promise<{ default: () => DocMeta<ComponentType<any>> }>;
  /** Корень исходников UI-компонентов - для секций API и автопримеров */
  componentsDir: string;
  /** Корень примеров - для кода ручных примеров */
  examplesDir?: string;
  /**
   * Репозиторий компонентов для ссылки "Исходник компонента". Указывайте,
   * если компоненты лежат в отдельном репозитории от документации. Путь к файлу
   * определяется относительно git-корня componentsDir. Если не задан -
   * используется repo документации (createDocSource) - подходит для монорепо.
   */
  repo?: RepoConfig;
}

/**
 * Плагин tulldoc для рендера .doc.tsx-документов: таблицы пропсов, автопримеры
 * по union-типам, ручные примеры. Подключается в createDocSource через plugins.
 */
export function componentDocs({
  importDoc,
  componentsDir,
  examplesDir,
  repo,
}: ComponentDocsOptions): TulldocPlugin {
  return {
    getMetadata(filePath: string) {
      const info = extractDocStrings(filePath);
      return {
        title: info.title ?? info.componentName,
        description: info.description,
      };
    },
    async renderDoc({
      file,
      strings,
      sourceUrl,
    }: {
      file: ContentFile;
      strings: DocStrings;
      sourceUrl?: (filePath: string) => string | undefined;
    }) {
      const { default: docFn } = await importDoc(file.importPath);
      if (typeof docFn !== "function") {
        throw new Error(
          `tulldoc: ${file.filePath} должен иметь default-экспорт функции, возвращающей DocMeta (сейчас default - ${typeof docFn})`,
        );
      }
      const meta = docFn();
      const staticInfo = extractDocStrings(file.filePath);
      const model = buildDocModel({ meta, strings, componentsDir, staticInfo });
      // Отдельный repo компонентов имеет приоритет; иначе - repo документации
      const componentHref = repo
        ? buildSourceUrl(repo, model.source.filePath, findGitRoot(componentsDir))
        : sourceUrl?.(model.source.filePath);
      return {
        headings: model.headings,
        sourceHref: componentHref,
        content: (
          <DocContent
            meta={meta}
            model={model}
            strings={strings}
            examplesDir={examplesDir}
          />
        ),
      };
    },
  };
}
