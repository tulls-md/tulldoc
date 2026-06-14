# @tulls-md/tulldoc

Ядро для быстрого создания сайтов документации компонентных библиотек на базе Next.js - MDX-сайт с роутингом из файловой системы, навигацией и готовыми UI-блоками.

> Документирование компонентов из исходного кода (таблицы пропсов из TypeScript-типов, автопримеры по union-типам, `.doc.tsx`-документы) - отдельный аддон [`@tulls-md/tulldoc-code`](#документирование-компонентов-аддон), устанавливаемый дополнительно.

## Возможности

- **Роутинг из файловой системы** - `.mdx`-файлы в `contentDir` автоматически становятся страницами
- **Боковая навигация** - строится из структуры папок, порядок управляется через `meta.json`
- **Готовые UI-блоки** - `CodeBlock`, `Preview`, `DocTabs`, `DocNotice` и другие
- **Подсветка синтаксиса** через Shiki, поддержка GFM и frontmatter

## Установка

```bash
npm install @tulls-md/tulldoc
```

Peer-зависимости: `next >= 16`, `react >= 19`, `react-dom >= 19`.

## Быстрый старт

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

## Точки входа пакета

| Путь                       | Назначение                                          |
| -------------------------- | --------------------------------------------------- |
| `@tulls-md/tulldoc`        | UI-блоки и MDX-утилиты (клиент + сервер)            |
| `@tulls-md/tulldoc/server` | Серверные хелперы: `createDocSource`, `getNavItems` |
| `@tulls-md/tulldoc/config` | `withTulldoc` - обёртка для `next.config.ts`        |

## Документирование компонентов (аддон)

Для таблиц пропсов, автопримеров и `.doc.tsx`-документов установите аддон и подключите плагин:

```bash
npm install @tulls-md/tulldoc-code
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

Подробнее - в README пакета [`@tulls-md/tulldoc-code`](https://github.com/tulls-md/tulldoc/tree/main/lib-code).

Полная документация и исходный код - в [репозитории tulls-md/tulldoc](https://github.com/tulls-md/tulldoc).

## Лицензия

MIT
