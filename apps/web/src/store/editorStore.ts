import { create } from 'zustand'
import type { ViewMode, Theme } from '@crapify/types'

const STORAGE_KEY = 'crapify:content'

const DEFAULT_CONTENT = `# Welcome to crapify

A fast, modern markdown editor with live preview.

## Features

- **Split pane** editor and preview
- Live rendering with syntax highlighting
- Math equations: $E = mc^2$
- Task lists, tables, and full GFM support

## Code example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}
\`\`\`

## Table

| Feature        | Status |
| -------------- | ------ |
| Editor         | ✅     |
| Preview        | ✅     |
| PDF export     | 🔜     |

> Paste your markdown on the left, see it rendered on the right.
`

interface EditorStore {
  content: string
  viewMode: ViewMode
  theme: Theme
  wordCount: number
  readingTime: number

  setContent: (content: string) => void
  setViewMode: (mode: ViewMode) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

function computeStats(text: string) {
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(words / 200))
  return { wordCount: words, readingTime }
}

const savedContent = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CONTENT
const initialStats = computeStats(savedContent)

export const useEditorStore = create<EditorStore>((set) => ({
  content: savedContent,
  viewMode: 'split',
  theme: (document.documentElement.classList.contains('dark') ? 'dark' : 'light') as Theme,
  wordCount: initialStats.wordCount,
  readingTime: initialStats.readingTime,

  setContent: (content) => {
    const stats = computeStats(content)
    set({ content, ...stats })
  },

  setViewMode: (viewMode) => set({ viewMode }),

  setTheme: (theme) => set({ theme }),

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}))
