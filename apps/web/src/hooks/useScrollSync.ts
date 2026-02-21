import { useCallback, useRef } from 'react'

/**
 * Synchronizes scroll position (as a percentage) between two scrollable containers.
 * Whichever pane the user scrolls drives the other.
 */
export function useScrollSync() {
  const editorScrollRef = useRef<HTMLDivElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const isSyncingRef = useRef(false)

  const syncScroll = useCallback(
    (source: 'editor' | 'preview') => () => {
      if (isSyncingRef.current) return
      isSyncingRef.current = true

      const sourceEl =
        source === 'editor' ? editorScrollRef.current : previewScrollRef.current
      const targetEl =
        source === 'editor' ? previewScrollRef.current : editorScrollRef.current

      if (sourceEl && targetEl) {
        const maxSourceScroll = sourceEl.scrollHeight - sourceEl.clientHeight
        const maxTargetScroll = targetEl.scrollHeight - targetEl.clientHeight

        if (maxSourceScroll > 0 && maxTargetScroll > 0) {
          const ratio = sourceEl.scrollTop / maxSourceScroll
          targetEl.scrollTop = ratio * maxTargetScroll
        }
      }

      requestAnimationFrame(() => {
        isSyncingRef.current = false
      })
    },
    [],
  )

  return { editorScrollRef, previewScrollRef, syncScroll }
}
