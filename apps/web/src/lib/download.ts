import { markdownToHtml } from '@crapify/markdown'
import { buildExportHtml } from './html-export'

// ---------------------------------------------------------------------------
// deriveFilename
// Extracts the first # heading from markdown and converts it to a safe
// filename slug. Falls back to "document" if no heading is found.
// ---------------------------------------------------------------------------

export function deriveFilename(content: string): string {
  const match = /^#{1,6}\s+(.+)$/m.exec(content)
  if (!match || !match[1]) return 'document'

  const slug = match[1]
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')   // strip non-word chars except hyphen/space
    .replace(/\s+/g, '-')        // spaces → hyphens
    .replace(/-+/g, '-')         // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '')     // trim leading/trailing hyphens
    .slice(0, 64)                 // cap length

  return slug || 'document'
}

// ---------------------------------------------------------------------------
// triggerDownload
// Creates an object URL for a Blob, clicks a hidden anchor, then cleans up.
// ---------------------------------------------------------------------------

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// downloadMarkdown
// Saves the raw markdown content as a .md file. Synchronous.
// ---------------------------------------------------------------------------

export function downloadMarkdown(content: string): void {
  const filename = deriveFilename(content)
  const blob = new Blob([content], { type: 'text/markdown; charset=utf-8' })
  triggerDownload(blob, `${filename}.md`)
}

// ---------------------------------------------------------------------------
// downloadHtml
// Runs the full markdown pipeline to get an HTML string, wraps it in a
// self-contained HTML shell (CDN links for KaTeX + Mermaid, embedded CSS),
// and downloads it as a .html file. Async because the pipeline is async.
// ---------------------------------------------------------------------------

export async function downloadHtml(content: string): Promise<void> {
  const filename = deriveFilename(content)
  const bodyHtml = await markdownToHtml(content)
  const fullHtml = buildExportHtml(bodyHtml, filename)
  const blob = new Blob([fullHtml], { type: 'text/html; charset=utf-8' })
  triggerDownload(blob, `${filename}.html`)
}
