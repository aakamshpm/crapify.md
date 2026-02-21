import { useCallback, useRef } from 'react'
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  Link, Code, Quote, List, ListOrdered, Table, Minus,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { useEditorStore } from '@/store/editorStore'

type WrapAction = { prefix: string; suffix?: string; placeholder?: string }
type InsertAction = { insert: string }
type ToolbarAction = WrapAction | InsertAction

interface ToolbarItem {
  label: string
  icon: React.ReactNode
  action: ToolbarAction
}

const TOOLBAR_ITEMS: (ToolbarItem | 'separator')[] = [
  { label: 'Bold', icon: <Bold className="h-3.5 w-3.5" />, action: { prefix: '**', suffix: '**', placeholder: 'bold text' } },
  { label: 'Italic', icon: <Italic className="h-3.5 w-3.5" />, action: { prefix: '_', suffix: '_', placeholder: 'italic text' } },
  { label: 'Strikethrough', icon: <Strikethrough className="h-3.5 w-3.5" />, action: { prefix: '~~', suffix: '~~', placeholder: 'strikethrough' } },
  'separator',
  { label: 'Heading 1', icon: <Heading1 className="h-3.5 w-3.5" />, action: { prefix: '# ', placeholder: 'Heading 1' } },
  { label: 'Heading 2', icon: <Heading2 className="h-3.5 w-3.5" />, action: { prefix: '## ', placeholder: 'Heading 2' } },
  { label: 'Heading 3', icon: <Heading3 className="h-3.5 w-3.5" />, action: { prefix: '### ', placeholder: 'Heading 3' } },
  'separator',
  { label: 'Link', icon: <Link className="h-3.5 w-3.5" />, action: { prefix: '[', suffix: '](url)', placeholder: 'link text' } },
  { label: 'Inline code', icon: <Code className="h-3.5 w-3.5" />, action: { prefix: '`', suffix: '`', placeholder: 'code' } },
  { label: 'Blockquote', icon: <Quote className="h-3.5 w-3.5" />, action: { prefix: '> ', placeholder: 'quote' } },
  'separator',
  { label: 'Bullet list', icon: <List className="h-3.5 w-3.5" />, action: { prefix: '- ', placeholder: 'list item' } },
  { label: 'Ordered list', icon: <ListOrdered className="h-3.5 w-3.5" />, action: { prefix: '1. ', placeholder: 'list item' } },
  { label: 'Table', icon: <Table className="h-3.5 w-3.5" />, action: { insert: '\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Cell     | Cell     | Cell     |\n' } },
  { label: 'Horizontal rule', icon: <Minus className="h-3.5 w-3.5" />, action: { insert: '\n---\n' } },
]

function applyAction(content: string, action: ToolbarAction): string {
  if ('insert' in action) {
    return content + action.insert
  }

  const { prefix, suffix = '', placeholder = 'text' } = action
  return content + prefix + placeholder + suffix
}

export function EditorToolbar() {
  const { setContent, content } = useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAction = useCallback(
    (action: ToolbarAction) => {
      setContent(applyAction(content, action))
    },
    [content, setContent],
  )

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result
        if (typeof text === 'string') setContent(text)
      }
      reader.readAsText(file)
      // Reset input so the same file can be re-uploaded
      e.target.value = ''
    },
    [setContent],
  )

  return (
    <div className="flex h-9 shrink-0 items-center gap-0.5 border-b border-border bg-muted/20 px-2 overflow-x-auto">
      {TOOLBAR_ITEMS.map((item, index) => {
        if (item === 'separator') {
          return <Separator key={index} orientation="vertical" className="mx-1 h-4" />
        }
        return (
          <Tooltip key={item.label} content={item.label} side="bottom">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => handleAction(item.action)}
              aria-label={item.label}
            >
              {item.icon}
            </Button>
          </Tooltip>
        )
      })}

      <div className="ml-auto flex items-center">
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Tooltip content="Upload .md file" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload markdown file"
          >
            <Upload className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  )
}
