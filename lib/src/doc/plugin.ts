import type { ReactNode } from "react";
import type { ContentFile } from "../content/content-files";
import type { DocStrings } from "../shared/strings";
import type { TocHeading } from "../shared/types";

/**
 * Точка расширения createDocSource. Ядро не умеет рендерить .doc.tsx само -
 * эту возможность добавляет аддон @tulls-md/tulldoc-code через componentDocs().
 */
export interface TulldocPlugin {
  /** Метаданные doc-файла для generateMetadata и заголовков навигации */
  getMetadata(filePath: string): { title?: string; description?: string };
  /** Рендер doc-файла: заголовки для TOC + содержимое страницы */
  renderDoc(args: {
    file: ContentFile;
    strings: DocStrings;
    /** Построитель ссылки на файл в репозитории; undefined, если repo не задан */
    sourceUrl?: (filePath: string) => string | undefined;
  }): Promise<{
    headings: TocHeading[];
    content: ReactNode;
    /** Ссылка на исходник документируемого компонента, если доступна */
    sourceHref?: string;
  }>;
}
