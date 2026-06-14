# @tulls-md/tulldoc-code

Аддон к [`@tulls-md/tulldoc`](https://github.com/tulls-md/tulldoc/tree/main/lib) для документирования React-компонентов прямо из исходного кода: таблицы пропсов извлекаются из TypeScript-типов, примеры вариантов генерируются автоматически по union-типам - документация не расходится с кодом.

Вынесен в отдельный пакет, чтобы проектам, которым нужна только MDX-документация, не тянуть зависимости анализа кода (`@babel/parser`, `typescript`-compiler).

## Возможности

- **`.doc.tsx`-документы** - описывают компонент декларативно: автопримеры по пропсам, ручные примеры, таблица пропсов
- **MDX-хелперы** - `createComponentPreview`, `createComponentExamples`, `createComponentProps` для использования в `.mdx`
- **UI-блоки** - `PropsTable`, `ComponentPreview`, `ExampleVariants`, `Anatomy`

## Установка

```bash
npm install @tulls-md/tulldoc @tulls-md/tulldoc-code
```

Аддон требует ядро `@tulls-md/tulldoc`. Peer-зависимости: `next >= 16`, `react >= 19`, `react-dom >= 19`.

## Подключение

Добавьте плагин `componentDocs` в `createDocSource`:

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
      // импорт .doc.tsx-документов из contentDir
      importDoc: (path) => import(`./content/${path}.doc.tsx`),
      // корень исходников UI-компонентов - для API-таблиц и автопримеров
      componentsDir: join(process.cwd(), "../ui/src/components"),
      // корень примеров - для кода ручных примеров (необязательно)
      examplesDir: join(process.cwd(), "src/examples"),
    }),
  ],
  lang: "ru",
});
```

После этого `.doc.tsx`-файлы в `contentDir` становятся страницами документации компонента, а в `.mdx` доступны хелперы `createComponentPreview`/`createComponentExamples`/`createComponentProps` из `@tulls-md/tulldoc-code/server`.

## Точки входа пакета

| Путь                            | Назначение                                                              |
| ------------------------------- | ----------------------------------------------------------------------- |
| `@tulls-md/tulldoc-code`        | UI-блоки `PropsTable`, `ComponentPreview`, `ExampleVariants`, `Anatomy` |
| `@tulls-md/tulldoc-code/server` | `componentDocs` (плагин), `createComponentPreview`/`Examples`/`Props`   |

## Лицензия

MIT
