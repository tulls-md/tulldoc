# @tulls-md/tulldoc

## 0.7.0

### Minor Changes

- dab6d0e: Единый вид превью, markdown в описаниях и таблицы API для сборных компонентов

  `@tulls-md/tulldoc`:

  - Новый компонент `Markdown` - рендер markdown-строк (инлайн-разметка и списки) с автолинковкой инлайн-кода через
    `codeLinks`
  - У `Preview` появился проп `canvas` - точечный фон с отступами
  - В `DocStrings` добавлена строка `deprecated`

  `@tulls-md/tulldoc-code`:

  - Точечный канвас теперь у всех превью по умолчанию: ручные примеры, `mainExample`; отключается через `view: "plain"` (
    новое значение `ExampleView`) и `mainExampleView`
  - Markdown во всех описаниях: `DocMeta.description`, описания примеров и JSDoc-описания пропов в таблице API
  - Новое поле `DocMeta.subcomponents` - отдельная таблица API для каждого подкомпонента сборного компонента
  - У автопримера с кастомным `title` имя пропа больше не пропадает - показывается бейджем-ссылкой рядом с заголовком
  - Таблица API: поддержка JSDoc `@deprecated` (бейдж, зачёркнутое имя) и `@default`/`@defaultValue`; стабильные якоря
    строк `props-<компонент>-<проп>`; упоминания пропов в инлайн-коде описаний линкуются на строки таблицы
  - `mainExample`-объект пропсов теперь показывает сгенерированный код-блок

## 0.6.0

### Minor Changes

- 7d033c0: Feature: create documentation sections

## 0.5.0

### Minor Changes

- 7277036: Add overview code-blocks and font showcase block

## 0.4.1

### Patch Changes

- 5bbf6e4: Add link to tulldoc in footer
- caf28c6: Fix: <pre> margin-button in code-block

## 0.3.0

### Added

- Added a component to describe css variables in mdx

## 0.2.0

### Added

- Mobile navigation
- Collapsible table of contents (TOC) on mobile: the heading becomes a button,
  the list of sections expands on tap and closes after a section is selected.

## 0.1.0

### Tulldoc — Initial Release 🎉

Tulldoc is a library for quickly building documentation sites for component libraries, powered by Next.js.

Documentation is generated straight from your component source code: props tables are extracted from TypeScript types,
and variant examples are
produced automatically from union types — so your docs never drift out of sync with your code.

▎ ⚠️ Early stage. The library is still under active development and the API may change before a stable 1.0.

✨ Highlights

Core (@tulls-md/tulldoc) — an MDX documentation site:

File-system routing — .mdx files in your contentDir automatically become pages
Auto sidebar navigation — built from your folder structure, with ordering controlled via meta.json
Ready-made UI blocks — CodeBlock, Preview, DocTabs, DocNotice, and more
Syntax highlighting via Shiki, plus GFM and frontmatter support
📋 Requirements

Peer dependencies: next >= 16, react >= 19, react-dom >= 19
Development: Node.js >= 24, pnpm >= 10
