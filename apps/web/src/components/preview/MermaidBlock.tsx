import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

let mermaidInitialized = false

function ensureMermaidInit(isDark: boolean) {
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
    })
    mermaidInitialized = true
  }
}

let diagramCounter = 0

interface MermaidBlockProps {
  diagram: string
}

export function MermaidBlock({ diagram }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const idRef = useRef(`mermaid-${++diagramCounter}`)
  const isDark = document.documentElement.classList.contains('dark')

  useEffect(() => {
    if (!containerRef.current) return

    ensureMermaidInit(isDark)
    setError(null)

    mermaid
      .render(idRef.current, diagram)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to render diagram'
        setError(message)
      })
  }, [diagram, isDark])

  if (error) {
    return (
      <div className="my-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <strong>Mermaid error:</strong> {error}
      </div>
    )
  }

  return (
    <div className="mermaid-container my-4">
      <div ref={containerRef} />
    </div>
  )
}
