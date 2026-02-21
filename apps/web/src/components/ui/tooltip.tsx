import * as React from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, side = 'bottom', className }: TooltipProps) {
  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1',
  }

  return (
    <div className={cn('group relative inline-flex', className)}>
      {children}
      <span
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100',
          sideClasses[side],
        )}
      >
        {content}
      </span>
    </div>
  )
}
