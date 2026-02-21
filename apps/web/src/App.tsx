import { useEffect } from 'react'
import { AppHeader } from '@/components/layout/AppHeader'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { useEditorStore } from '@/store/editorStore'
import { useAutoSave } from '@/hooks/useAutoSave'

export default function App() {
  const theme = useEditorStore((s) => s.theme)

  // Sync Tailwind dark class with theme state
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // Auto-save to localStorage
  useAutoSave()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <AppHeader />
      <SplitLayout />
    </div>
  )
}
