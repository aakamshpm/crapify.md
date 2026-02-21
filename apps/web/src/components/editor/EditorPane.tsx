import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { EditorToolbar } from './EditorToolbar'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useRef, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'

const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    height: '100%',
  },
  '.cm-content': {
    padding: '16px',
    caretColor: 'hsl(var(--foreground))',
  },
  '.cm-line': {
    color: 'hsl(var(--foreground))',
  },
  '.cm-gutters': {
    backgroundColor: 'hsl(var(--muted))',
    borderRight: '1px solid hsl(var(--border))',
    color: 'hsl(var(--muted-foreground))',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'hsl(var(--accent))',
  },
  '.cm-activeLine': {
    backgroundColor: 'hsl(var(--accent) / 0.4)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'hsl(var(--primary) / 0.2) !important',
  },
  '.cm-cursor': {
    borderLeftColor: 'hsl(var(--foreground))',
  },
})

const editorExtensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
]

interface EditorPaneProps {
  scrollRef?: React.RefObject<HTMLDivElement>
  onScroll?: () => void
}

export function EditorPane({ scrollRef, onScroll }: EditorPaneProps) {
  const { content, setContent, theme } = useEditorStore()
  const editorRef = useRef<ReactCodeMirrorRef>(null)

  const handleChange = useCallback(
    (value: string) => {
      setContent(value)
    },
    [setContent],
  )

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-border">
      {/* Pane header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Markdown
        </span>
      </div>

      {/* Formatting toolbar */}
      <EditorToolbar />
      {/* Editor */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-auto">
        <CodeMirror
          ref={editorRef}
          value={content}
          onChange={handleChange}
          extensions={editorExtensions}
          theme={theme === 'dark' ? oneDark : lightTheme}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            searchKeymap: true,
          }}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}
