import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'

const STORAGE_KEY = 'crapify:content'
const DEBOUNCE_MS = 800

export function useAutoSave() {
  const content = useEditorStore((s) => s.content)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, content)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [content])
}
