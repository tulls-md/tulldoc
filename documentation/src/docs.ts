import { join } from "path";
import { createDocSource } from "@tulls-md/tulldoc/server";

// Документирование компонентов (.doc.tsx) - отдельный аддон @tulls-md/tulldoc-code.
// Установите его и раскомментируйте, чтобы подключить:
// import { componentDocs } from "@tulls-md/tulldoc-code/server";

export const docs = createDocSource({
  contentDir: join(process.cwd(), "src/content"),
  importContent: (path) => import(`./content/${path}.mdx`),
  repo: { url: "https://github.com/tulls-md/tulldoc", branch: "main" },
  lang: "ru",
});
