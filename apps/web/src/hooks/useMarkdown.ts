import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { processMarkdown } from '@/lib/markdown'

export function useMarkdown(content: string) {
  const [rendered, setRendered] = useState<ReactNode>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setIsProcessing(true)

    debounceRef.current = setTimeout(() => {
      processMarkdown(content)
        .then((result) => {
          setRendered(result)
          setIsProcessing(false)
        })
        .catch((err) => {
          console.error('[useMarkdown] processing error:', err)
          setIsProcessing(false)
        })
    }, 100)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [content])

  return { rendered, isProcessing }
}
