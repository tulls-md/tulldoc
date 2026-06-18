# @tulls-md/tulldoc

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
