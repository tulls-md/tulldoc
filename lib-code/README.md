# @tulls-md/tulldoc-code

> An addon for [`@tulls-md/tulldoc`](https://github.com/tulls-md/tulldoc/tree/main/lib) that documents React components straight from their source: props tables are extracted from TypeScript types, and variant examples are generated automatically from union types — so the documentation never drifts out of sync with the code.

[**📖 Documentation**](https://tulldoc.tulls.ru/) · [Installation](#installation) · [Setup](#setup)

It ships as a separate package so that projects needing only MDX documentation don't pull in code-analysis dependencies (`@babel/parser`, the `typescript` compiler).

## Features

- 📄 **`.doc.tsx` documents** — describe a component declaratively: prop-driven auto examples, manual examples, and a props table.
- 🧩 **MDX helpers** — `createComponentPreview`, `createComponentExamples`, `createComponentProps` for use inside `.mdx`.
- 🧱 **UI blocks** — `PropsTable`, `ComponentPreview`, `ExampleVariants`, `Anatomy`.

## Installation

```bash
# npm
npm install @tulls-md/tulldoc @tulls-md/tulldoc-code

# pnpm
pnpm add @tulls-md/tulldoc @tulls-md/tulldoc-code

# yarn
yarn add @tulls-md/tulldoc @tulls-md/tulldoc-code

# bun
bun add @tulls-md/tulldoc @tulls-md/tulldoc-code
```

The addon requires the `@tulls-md/tulldoc` core. **Peer dependencies:** `next >= 16`, `react >= 19`, `react-dom >= 19`.

## Setup

Register the `componentDocs` plugin in `createDocSource`:

```ts
// src/docs.ts
import { join } from "path";
import { createDocSource } from "@tulls-md/tulldoc/server";
import { componentDocs } from "@tulls-md/tulldoc-code/server";

export const docs = createDocSource({
  contentDir: join(process.cwd(), "src/content"),
  importContent: (path) => import(`./content/${path}.mdx`),
  plugins: [
    componentDocs({
      // import .doc.tsx documents from contentDir
      importDoc: (path) => import(`./content/${path}.doc.tsx`),
      // root of the UI component sources — for API tables and auto examples
      componentsDir: join(process.cwd(), "../ui/src/components"),
      // root of the examples — for manual example code (optional)
      examplesDir: join(process.cwd(), "src/examples"),
    }),
  ],
  lang: "en",
});
```

After this, `.doc.tsx` files in `contentDir` become component documentation pages, and the `createComponentPreview` / `createComponentExamples` / `createComponentProps` helpers from `@tulls-md/tulldoc-code/server` become available inside `.mdx`.

## Package entry points

| Entry point                     | Purpose                                                                   |
| ------------------------------- | ------------------------------------------------------------------------- |
| `@tulls-md/tulldoc-code`        | UI blocks: `PropsTable`, `ComponentPreview`, `ExampleVariants`, `Anatomy` |
| `@tulls-md/tulldoc-code/server` | `componentDocs` plugin, `createComponentPreview` / `Examples` / `Props`   |

Full documentation: **[tulldoc.tulls.ru](https://tulldoc.tulls.ru/)** · Source code: [tulls-md/tulldoc](https://github.com/tulls-md/tulldoc).

## License

MIT
