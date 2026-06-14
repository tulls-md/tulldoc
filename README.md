# Tulldoc

> Библиотека в разработке и еще не готова к публикации и использованию

<img src="assets/logo.jpeg" alt="Tulldoc" width="300" />

`@tulls-md/tulldoc` - библиотека для быстрого создания сайтов документации компонентных библиотек на базе Next.js.

Документация и примеры строятся прямо из исходного кода компонентов: таблицы пропсов извлекаются из TypeScript-типов, примеры вариантов генерируются автоматически по union-типам - документация не расходится с кодом.

## Возможности

Ядро `@tulls-md/tulldoc` - MDX-сайт документации:

- **Роутинг из файловой системы** - `.mdx`-файлы в `contentDir` автоматически становятся страницами
- **Боковая навигация** - строится из структуры папок, порядок управляется через `meta.json`
- **Готовые UI-блоки** - `CodeBlock`, `Preview`, `DocTabs`, `DocNotice` и другие
- **Подсветка синтаксиса** через Shiki, поддержка GFM и frontmatter

Документирование компонентов из исходного кода - отдельный аддон [`@tulls-md/tulldoc-code`](#аддон-tulls-mdtulldoc-code) (таблицы пропсов из TypeScript-типов, автопримеры по union-типам, `.doc.tsx`-документы). Его ставят дополнительно - тем, кому нужна только MDX-документация, не приходится тянуть зависимости анализа кода (`@babel/parser`, `typescript`-compiler).

Peer-зависимости: `next >= 16`, `react >= 19`, `react-dom >= 19`.

Оберните конфиг Next.js:

```ts
// next.config.ts
import { withTulldoc } from "@tulls-md/tulldoc/config";

export default withTulldoc();
```

Создайте источник документации:

```ts
// src/docs.ts
import { join } from "path";
import { createDocSource } from "@tulls-md/tulldoc/server";

export const docs = createDocSource({
  contentDir: join(process.cwd(), "src/content"),
  importContent: (path) => import(`./content/${path}.mdx`),
  lang: "ru",
});
```

И подключите роутер в App Router:

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

Полная инструкция - в разделе «Начало работы» документации.

## Точки входа пакета

Ядро `@tulls-md/tulldoc`:

| Путь                       | Назначение                                          |
| -------------------------- | --------------------------------------------------- |
| `@tulls-md/tulldoc`        | UI-блоки и MDX-утилиты (клиент + сервер)            |
| `@tulls-md/tulldoc/server` | Серверные хелперы: `createDocSource`, `getNavItems` |
| `@tulls-md/tulldoc/config` | `withTulldoc` - обёртка для `next.config.ts`        |

## Аддон `@tulls-md/tulldoc-code`

Документирование React-компонентов из исходного кода - устанавливается **отдельно**:

```bash
pnpm add @tulls-md/tulldoc-code
```

| Путь                            | Назначение                                                              |
| ------------------------------- | ----------------------------------------------------------------------- |
| `@tulls-md/tulldoc-code`        | UI-блоки `PropsTable`, `ComponentPreview`, `ExampleVariants`, `Anatomy` |
| `@tulls-md/tulldoc-code/server` | `componentDocs` (плагин), `createComponentPreview`/`Examples`/`Props`   |

Подключается в `createDocSource` через плагин:

```ts
// src/docs.ts
import { createDocSource } from "@tulls-md/tulldoc/server";
import { componentDocs } from "@tulls-md/tulldoc-code/server";

export const docs = createDocSource({
  contentDir: join(process.cwd(), "src/content"),
  importContent: (path) => import(`./content/${path}.mdx`),
  plugins: [
    componentDocs({
      importDoc: (path) => import(`./content/${path}.doc.tsx`),
      componentsDir: join(process.cwd(), "../ui/src/components"),
      examplesDir: join(process.cwd(), "src/examples"),
    }),
  ],
  lang: "ru",
});
```

Без аддона `.doc.tsx`-документы недоступны, а `createDocSource` обрабатывает только `.mdx`.

## Структура репозитория

Это pnpm-монорепозиторий:

| Пакет            | Описание                                                       |
| ---------------- | -------------------------------------------------------------- |
| `lib/`           | Ядро `@tulls-md/tulldoc` (MDX-сайт)                            |
| `lib-code/`      | Аддон `@tulls-md/tulldoc-code` (документирование компонентов)  |
| `documentation/` | Сайт документации tulldoc (сам на нём и построен)              |
| `example/`       | Пример проекта документации (в планах)                         |
| `example-lib/`   | Пример компонентной библиотеки для документирования (в планах) |

## Разработка

Требования: Node.js >= 24, pnpm >= 10.

```bash
pnpm install

# запустить сайт документации (dev-режим)
pnpm tulldoc:docs

# запустить сайт примера (dev-режим)
pnpm tulldoc:examle

# форматирование
pnpm format
pnpm format:check
```
