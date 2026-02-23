# crapify.md

i hate all the markdown file editors/viewers out there (except dillinger), so i built one.

## Tech Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| Monorepo     | Turborepo + pnpm workspaces             |
| Frontend     | React 18, Vite 6, TypeScript            |
| Editor       | CodeMirror 6                            |
| Markdown     | unified, remark, rehype pipeline        |
| Styling      | Tailwind CSS 3, @tailwindcss/typography |
| State        | Zustand                                 |
| Backend      | NestJS 10                               |
| Shared Types | `@crapify/types` package                |

## Project Structure

```
crapify.md/
├── apps/
│   ├── api/              # NestJS backend (PDF export stub)
│   │   └── src/
│   │       ├── main.ts
│   │       └── modules/
│   │           └── export/
│   └── web/              # React + Vite frontend
│       └── src/
│           ├── components/
│           │   ├── editor/
│           │   ├── preview/
│           │   ├── layout/
│           │   └── ui/
│           ├── hooks/
│           ├── lib/
│           └── store/
├── packages/
│   └── types/            # Shared TypeScript types
├── turbo.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0

If you don't have pnpm, install it via corepack (ships with Node.js):

```bash
corepack enable
corepack prepare pnpm@10.30.1 --activate
```

Or install globally:

```bash
npm install -g pnpm@10.30.1
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/aakamshpm/crapify.md.git
cd crapify.md

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

This starts both apps via Turborepo:

| App            | URL                   | Description                |
| -------------- | --------------------- | -------------------------- |
| `@crapify/web` | http://localhost:5173 | Frontend (Vite dev server) |
| `@crapify/api` | http://localhost:3000 | Backend (NestJS)           |

API requests from the frontend are proxied to the backend automatically via Vite's dev server proxy (`/api` -> `http://localhost:3000`).

## Scripts

Run these from the repo root:

| Command      | Description                                              |
| ------------ | -------------------------------------------------------- |
| `pnpm dev`   | Start all apps in development mode                       |
| `pnpm build` | Build all apps and packages                              |
| `pnpm lint`  | Lint all apps and packages                               |
| `pnpm test`  | Run tests across the monorepo                            |
| `pnpm clean` | Remove all `dist/`, `node_modules/`, and build artifacts |

## Environment Variables

No `.env` file is required for local development -- defaults work out of the box.

Optional overrides for `apps/api`:

| Variable      | Default                 | Description         |
| ------------- | ----------------------- | ------------------- |
| `PORT`        | `3000`                  | API server port     |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

## License

MIT
