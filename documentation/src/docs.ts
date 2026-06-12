import { join } from "path";
import { createDocSource } from "@tulls-md/tulldoc/server";

export const docs = createDocSource({
  contentDir: join(process.cwd(), "src/content"),
  importContent: (path) => import(`./content/${path}.mdx`),
  // importDoc: (path) => import(`./content/${path}.doc.tsx`),
  // componentsDir: join(process.cwd(), "../../packages/ui-web/src/components"),
  // examplesDir: join(process.cwd(), "src/examples"),
  lang: "ru",
});
