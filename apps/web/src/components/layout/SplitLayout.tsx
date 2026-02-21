import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { useEditorStore } from '@/store/editorStore'
import { useScrollSync } from '@/hooks/useScrollSync'
import { EditorPane } from '@/components/editor/EditorPane'
import { PreviewPane } from '@/components/preview/PreviewPane'

export function SplitLayout() {
  const viewMode = useEditorStore((s) => s.viewMode)
  const { editorScrollRef, previewScrollRef, syncScroll } = useScrollSync()

  if (viewMode === 'editor-only') {
    return (
      <div className="flex-1 overflow-hidden">
        <EditorPane />
      </div>
    )
  }

  if (viewMode === 'preview-only') {
    return (
      <div className="flex-1 overflow-hidden">
        <PreviewPane />
      </div>
    )
  }

  return (
    <PanelGroup direction="horizontal" className="flex-1">
      <Panel defaultSize={50} minSize={20}>
        <EditorPane
          scrollRef={editorScrollRef}
          onScroll={syncScroll('editor')}
        />
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={50} minSize={20}>
        <PreviewPane
          scrollRef={previewScrollRef}
          onScroll={syncScroll('preview')}
        />
      </Panel>
    </PanelGroup>
  )
}
