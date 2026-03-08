import { useState } from 'react'
import {
  Moon,
  Sun,
  FileText,
  Columns2,
  PanelLeft,
  PanelRight,
  Download,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { useEditorStore } from '@/store/editorStore'
import type { ViewMode } from '@crapify/types'

const VIEW_MODES: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'editor-only', icon: <PanelLeft className="h-4 w-4" />, label: 'Editor only' },
  { mode: 'split', icon: <Columns2 className="h-4 w-4" />, label: 'Split view' },
  { mode: 'preview-only', icon: <PanelRight className="h-4 w-4" />, label: 'Preview only' },
]

export function AppHeader() {
  const { viewMode, setViewMode, theme, toggleTheme, wordCount, readingTime, content } =
    useEditorStore()

  const [exporting, setExporting] = useState(false)

  async function handleExportPdf() {
    if (exporting) return

    const trimmed = content.trim()
    if (!trimmed) return

    setExporting(true)
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: trimmed }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error')
        throw new Error(`Export failed (${res.status}): ${text}`)
      }

      // Download the PDF blob
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')

      // Extract filename from Content-Disposition header, fallback to "document"
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const filenameMatch = /filename="?([^"]+)"?/.exec(disposition)
      a.download = filenameMatch?.[1] ?? 'document.pdf'

      a.href = url
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF export error:', err)
      // TODO: will show a toast here
    } finally {
      setExporting(false)
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold tracking-tight">crapify.md</span>
      </div>

      {/* View mode toggles */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5">
        {VIEW_MODES.map(({ mode, icon, label }) => (
          <Tooltip key={mode} content={label} side="bottom">
            <Button
              variant={viewMode === mode ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode(mode)}
              className="h-7 w-7"
              aria-label={label}
              aria-pressed={viewMode === mode}
            >
              {icon}
            </Button>
          </Tooltip>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Stats */}
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <span>{wordCount.toLocaleString()} words</span>
          <Separator orientation="vertical" className="h-3" />
          <span>{readingTime} min read</span>
        </div>

        <Separator orientation="vertical" className="h-5 hidden sm:block" />

        {/* Export PDF */}
        <Tooltip content="Export PDF" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportPdf}
            disabled={exporting || !content.trim()}
            className="h-8 w-8"
            aria-label="Export PDF"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>

        {/* Theme toggle */}
        <Tooltip content={theme === 'light' ? 'Dark mode' : 'Light mode'} side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </Tooltip>
      </div>
    </header>
  )
}
