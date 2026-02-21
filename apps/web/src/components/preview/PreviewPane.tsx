import { Loader2 } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { useMarkdown } from '@/hooks/useMarkdown'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'

interface PreviewPaneProps {
  scrollRef?: React.RefObject<HTMLDivElement>
  onScroll?: () => void
}

export function PreviewPane({ scrollRef, onScroll }: PreviewPaneProps) {
  const { content, theme } = useEditorStore()
  const { rendered, isProcessing } = useMarkdown(content)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Pane header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Preview
        </span>
        {isProcessing && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Rendered content */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-auto"
      >
        <div
          className={cn(
            'prose max-w-none px-8 py-6',
            theme === 'dark' ? 'prose-invert' : '',
            // Typography customisations
            'prose-headings:font-semibold prose-headings:tracking-tight',
            'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
            'prose-blockquote:border-l-primary',
            'prose-img:rounded-lg',
            'prose-table:overflow-hidden prose-table:rounded-lg',
            'prose-th:bg-muted/60',
            'prose-hr:border-border',
          )}
        >
          {rendered}
        </div>
      </div>
    </div>
  )
}
