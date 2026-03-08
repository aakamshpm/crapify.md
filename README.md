# crapify.md

i hate all the markdown editors out there (except dillinger), so i built one.

A browser-based split-pane Markdown editor with live preview. Type on the left, see styled output on the right.

---

## Features

- **Split-pane editing** — resizable editor and preview side by side, or focus on either alone
- **GitHub Flavored Markdown** — tables, task lists, strikethrough, autolinks
- **Math equations** — LaTeX syntax via KaTeX (`$inline$` and `$$block$$`)
- **Syntax highlighting** — VS Code-quality code blocks via Shiki (light + dark themes)
- **Mermaid diagrams** — flowcharts, sequence diagrams, etc. rendered in-browser
- **Formatting toolbar** — 15 actions (bold, italic, headings, code, links, lists, etc.)
- **File operations** — open `.md` files, download as Markdown or standalone HTML
- **PDF export** — server-side PDF generation via headless Chrome (Puppeteer)
- **Auto-save** — content persisted to `localStorage` automatically
- **Dark / light theme**

---

## Tech Stack

| Layer    | Technology                                |
| -------- | ----------------------------------------- |
| Monorepo | Turborepo + pnpm workspaces               |
| Frontend | React 18, Vite 6, TypeScript              |
| Editor   | CodeMirror 6                              |
| Markdown | unified / remark / rehype pipeline        |
| Math     | KaTeX                                     |
| Diagrams | Mermaid                                   |
| Styling  | Tailwind CSS 3, `@tailwindcss/typography` |
| State    | Zustand                                   |
| Backend  | NestJS 10 (PDF export only)               |
| PDF      | Puppeteer (headless Chrome)               |

---

## Project Structure

```
crapify.md/
├── apps/
│   ├── web/              # React + Vite frontend
│   │   └── src/
│   │       ├── components/
│   │       │   ├── editor/     # CodeMirror editor + toolbar
│   │       │   ├── preview/    # rendered markdown + Mermaid
│   │       │   ├── layout/     # AppHeader, SplitLayout
│   │       │   └── ui/         # Button, Tooltip, Separator
│   │       ├── hooks/          # useAutoSave, useMarkdown, useScrollSync
│   │       ├── lib/            # markdown processor, download utilities
│   │       └── store/          # Zustand store
│   └── api/              # NestJS backend
│       └── src/
│           └── modules/
│               └── export/     # PDF export endpoint
└── packages/
    ├── types/            # shared TypeScript types (@crapify/types)
    └── markdown/         # shared markdown pipeline (@crapify/markdown)
```

The frontend and backend are separate processes. Vite proxies `/api/*` requests to the NestJS server, so to the browser everything looks like one origin.

---

## How It Works

**Markdown pipeline** — the core of the app. Raw markdown flows through a chain of `unified` plugins: GFM → math → HTML AST → KaTeX → Mermaid → syntax highlighting → output. This pipeline lives in `packages/markdown` and is shared by both the frontend (outputs React nodes) and the backend (outputs an HTML string for Puppeteer).

**Editor** — CodeMirror 6 with a markdown language extension. Every keystroke updates the Zustand store, which triggers a re-render of the preview.

**Preview** — the pipeline result is rendered as actual React elements (no `dangerouslySetInnerHTML`). Mermaid diagrams are rendered client-side after mount.

**PDF export** — the frontend sends raw markdown to `POST /api/export/pdf`. NestJS runs the pipeline to produce an HTML string, wraps it in a full HTML document, and feeds it to a persistent Puppeteer browser instance. The resulting PDF buffer is streamed back as a file download.

---

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9

```bash
# Enable pnpm via corepack (ships with Node.js)
corepack enable
corepack prepare pnpm@10.30.1 --activate
```

---

## Getting Started

```bash
git clone https://github.com/aakamshpm/crapify.md.git
cd crapify.md

pnpm install
pnpm dev
```

| App | URL                   |
| --- | --------------------- |
| Web | http://localhost:5173 |
| API | http://localhost:3000 |

---

## Scripts

Run from the repo root:

| Command      | Description                                      |
| ------------ | ------------------------------------------------ |
| `pnpm dev`   | Start all apps in development mode               |
| `pnpm build` | Build all apps and packages (respects dep order) |
| `pnpm lint`  | Lint all apps and packages                       |
| `pnpm clean` | Remove all `dist/`, `node_modules/`, build cache |

---

## Environment Variables

No `.env` file needed for local development — defaults work out of the box.

Optional overrides for `apps/api`:

| Variable      | Default                 | Description         |
| ------------- | ----------------------- | ------------------- |
| `PORT`        | `3000`                  | API server port     |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

---

## License

MIT
