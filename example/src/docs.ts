import { join } from "path";
import { createDocSource } from "@tulls-md/tulldoc/server";
import { componentDocs } from "@tulls-md/tulldoc-code/server";

export const docs = createDocSource({
  contentDir: join(process.cwd(), "src/content"),
  importContent: (path) => import(`./content/${path}.mdx`),
  plugins: [
    componentDocs({
      importDoc: (path) => import(`./content/${path}.doc.tsx`),
      componentsDir: join(process.cwd(), "src/components"),
      examplesDir: join(process.cwd(), "src/examples"),
    }),
  ],
  lang: "ru",
});
