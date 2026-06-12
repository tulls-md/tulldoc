# @tulls-md/tulldoc

Библиотека для быстрого создания сайтов документации компонентных библиотек на базе Next.js.

Документация и примеры строятся прямо из исходного кода компонентов: таблицы пропсов извлекаются из TypeScript-типов, примеры вариантов генерируются автоматически по union-типам - документация не расходится с кодом.

## Возможности

- **Роутинг из файловой системы** - `.mdx` и `.doc.tsx` файлы в `contentDir` автоматически становятся страницами
- **Боковая навигация** - строится из структуры папок, порядок управляется через `meta.json`
- **`.doc.tsx` документы** - описывают компонент декларативно: автопримеры по пропсам, ручные примеры, таблица пропсов
- **MDX-хелперы** - `createComponentPreview`, `createComponentExamples`, `createComponentProps` для использования в `.mdx`
- **Готовые UI-блоки** - `CodeBlock`, `Preview`, `PropsTable`, `Anatomy`, `DocTabs`, `DocNotice` и другие
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

| Путь                       | Назначение                                                              |
| -------------------------- | ----------------------------------------------------------------------- |
| `@tulls-md/tulldoc`        | React-компоненты и MDX-утилиты (клиент + сервер)                        |
| `@tulls-md/tulldoc/server` | Серверные хелперы: `createDocSource`, `createComponentPreview` и другие |
| `@tulls-md/tulldoc/config` | `withTulldoc` - обёртка для `next.config.ts`                            |

Полная документация и исходный код - в [репозитории tulls-md/tulldoc](https://github.com/tulls-md/tulldoc).

## Лицензия

MIT
