# @tulls-md/tulldoc

> The core of Tulldoc — quickly build documentation sites for component libraries with Next.js. An MDX site with file-system routing, generated navigation, and batteries-included UI blocks.

[**📖 Documentation**](https://tulldoc.tulls.ru/) · [Getting started](#getting-started) · [Addon](#documenting-components-addon)

> [!NOTE]
> Documenting components from source — props tables from TypeScript types, auto-generated variant examples, and `.doc.tsx` documents — lives in a separate addon, [`@tulls-md/tulldoc-code`](#documenting-components-addon), installed on demand.

## Features

- 📁 **File-system routing** — every `.mdx` file in your `contentDir` automatically becomes a page.
- 🧭 **Generated sidebar** — built from your folder structure, with ordering controlled via `meta.json`.
- 🧱 **Batteries-included UI** — ready-made blocks like `CodeBlock`, `Preview`, `DocTabs`, `DocNotice`, and more.
- 🎨 **First-class syntax highlighting** — powered by [Shiki](https://shiki.style), with GFM and frontmatter support.

## Installation

```bash
# npm
npm install @tulls-md/tulldoc

# pnpm
pnpm add @tulls-md/tulldoc

# yarn
yarn add @tulls-md/tulldoc

# bun
bun add @tulls-md/tulldoc
```

**Peer dependencies:** `next >= 16`, `react >= 19`, `react-dom >= 19`.

## Getting started

### 1. Wrap your Next.js config

```ts
// next.config.ts
import { withTulldoc } from "@tulls-md/tulldoc/config";

export default withTulldoc();
```

### 2. Create a documentation source

```ts
// src/docs.ts
import { join } from "path";
import { createDocSource } from "@tulls-md/tulldoc/server";

export const docs = createDocSource({
  contentDir: join(process.cwd(), "src/content"),
  importContent: (path) => import(`./content/${path}.mdx`),
  lang: "en",
});
```

### 3. Wire up the App Router

```tsx
// src/app/layout.tsx
import { docs } from "@/docs";

export default docs.Layout;
```

```tsx
// src/app/[...slug]/page.tsx
import { docs } from "@/docs";

export const dynamicParams = false;
export const generateStaticParams = docs.generateStaticParams;
export const generateMetadata = docs.generateMetadata;

export default docs.Page;
```

That's it — drop `.mdx` files into `src/content` and they become pages. See the [**Getting Started**](https://tulldoc.tulls.ru/) section of the docs for the full walkthrough.

## Package entry points

| Entry point                | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `@tulls-md/tulldoc`        | UI blocks and MDX utilities (client + server)    |
| `@tulls-md/tulldoc/server` | Server helpers: `createDocSource`, `getNavItems` |
| `@tulls-md/tulldoc/config` | `withTulldoc` — the wrapper for `next.config.ts` |

## Documenting components (addon)

For props tables, auto-generated examples, and `.doc.tsx` documents, install the addon and register its plugin:

```bash
# npm
npm install @tulls-md/tulldoc-code

# pnpm
pnpm add @tulls-md/tulldoc-code

# yarn
yarn add @tulls-md/tulldoc-code

# bun
bun add @tulls-md/tulldoc-code
```

```ts
// src/docs.ts
import { componentDocs } from "@tulls-md/tulldoc-code/server";

export const docs = createDocSource({
  contentDir,
  importContent: (path) => import(`./content/${path}.mdx`),
  plugins: [
    componentDocs({
      importDoc: (path) => import(`./content/${path}.doc.tsx`),
      componentsDir,
      examplesDir,
    }),
  ],
});
```

Learn more in the [`@tulls-md/tulldoc-code`](https://github.com/tulls-md/tulldoc/tree/main/lib-code) README.

Full documentation: **[tulldoc.tulls.ru](https://tulldoc.tulls.ru/)** · Source code: [tulls-md/tulldoc](https://github.com/tulls-md/tulldoc).

## License

MIT
