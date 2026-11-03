# 随机幂等 Astro Migration Implementation Plan

> **For agentic workers:** Execute inline with superpowers:executing-plans, task by task. This repository is already a dedicated migration checkout on codex/astro-migration; do not add another worktree.

**Goal:** Preserve the approved site and add tested Markdown publishing without changing production.

**Architecture:** Astro static pages share a layout and existing assets. A content collection supplies homepage summaries, /articles/, and per-article routes through one draft-aware selector. Native Node tests exercise publishing rules and real production output.

**Tech Stack:** Astro stable, TypeScript, Markdown, existing CSS and browser JavaScript, Node test runner, GitHub Actions.

**Spec:** docs/superpowers/specs/2026-11-03-astro-migration-design.md

## Global Constraints

- Keep https://stateraxai.github.io/ and /about/ and all approved personal content.
- No production publish, remote push, CMS installation, paid services, or invented articles.
- Public build must exclude draft content from lists and detail routes; private drafts stay local.
- Keep original static files during local development; remove their duplicates from the finished Astro root once migrated.
- Preserve root home anchor targets articles/projects/notes and nav order.

### Task 1: Publishing rules and dependency setup

Files: package.json, astro.config.mjs, tsconfig.json, .gitignore, src/lib/articles.ts, tests/articles.test.mjs.

- [x] Write tests importing selectArticles(entries, includeDrafts=false), formatArticleDate(date), articleHref(id). Assert draft filtering, newest-first order, date stability, encoded route segments.
- [x] Run `node --test tests/articles.test.mjs` and observe missing implementation failure.
- [x] Implement the typed helpers, install stable Astro and type checker with locked versions; set static output, trailingSlash always, site URL and local dev toolbar disabled.
- [x] Run tests and check supported Node engines.

### Task 2: Layout and content pages

Files: src/layouts/SiteLayout.astro, src/components/{Header,Navigation,Footer,ArticleList}.astro, src/pages/{index,about}.astro, src/pages/articles/{index,[...id]}.astro, src/content.config.ts, src/content/articles/.gitkeep, src/styles/global.css, public assets, src/scripts/site.js.

Interfaces: collection entries have id and data {title,description,date,draft,tags,cover?,coverAlt?}. All listing and route generation uses selectArticles(entries, import.meta.env.DEV).

- [x] Copy approved styles, scripts and assets unchanged; extract head, header, nav and footer into shared components with root-relative links.
- [x] Use `defineCollection({loader: glob({pattern:'**/*.md',base:'./src/content/articles'}),schema})`; validate required fields, ISO calendar date, draft defaults true, cover alt required with cover.
- [x] Homepage consumes collection; empty state remains and links to /articles/.
- [x] /articles/ displays titles, dates, descriptions and draft badges in development; details use getStaticPaths and render from astro:content.
- [x] Add scoped prose styles for Markdown headings, lists, code, images, tables and long links; keep home/about typography unchanged.
- [x] Build the empty site and check homepage, about, article list, scripts and assets.

### Task 3: Actual build validation and editor workflow

Files: tests/build.test.mjs, scripts/check-links.mjs, scripts/new-article.mjs, docs/article-template.md, README.md, .github/workflows/deploy.yml.

- [x] Integration test temporarily creates one publishable and one draft Markdown article. Run a production build and assert published list/detail and rendered code/image; assert no draft slug or content in public output. Remove fixtures in finally and rebuild empty production output.
- [x] Test date-only values, impossible dates, default draft, missing cover alt and unsafe article slugs. Validate all internal href/src resources and anchor targets in generated dist HTML.
- [x] Prepare CI check on pull_request; build and deploy only on push to main or workflow_dispatch on main. GitHub Pages source remains unchanged until publishing confirmation.
- [x] Add `npm run new:article -- my-first-post`, safely reject collisions and unsafe paths; create draft with today's local calendar date.
- [x] Document fresh install, local preview, content fields, public-repo draft caveat, build, publishing and rollback.
- [x] Validate in browser at desktop and mobile widths, theme memory, date, pixel title, about QR open/Escape/focus return; save screenshots.
- [x] Commit verified local migration and leave local preview running; provide preview and await explicit production publishing instruction.

## Self-review

All spec requirements map to tasks above. Empty content collection is intentional. Fixtures are synthetic test content and never become real articles. One shared filter controls lists and route visibility. The old static root files will not remain as an accidental alternative production entry point.

执行结果：18 项测试、类型检查、3 页 38 个内部链接与浏览器检查通过。仅保留本地分支与预览，尚未发布生产。
