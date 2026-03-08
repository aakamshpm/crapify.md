import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import type { ReactNode } from 'react'
import rehypeReact from 'rehype-react'
import { createBaseProcessor } from '@crapify/markdown'
import { MermaidBlock } from '@/components/preview/MermaidBlock'

// ---------------------------------------------------------------------------
// Build the processor once (expensive — shiki loads lazily on first call)
// Takes the shared base processor and appends rehype-react for React output.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProcessor(): any {
  return createBaseProcessor()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .use(rehypeReact as any, {
      Fragment,
      jsx,
      jsxs,
      components: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'mermaid-block': ({ diagram }: { diagram: string }) =>
          jsx(MermaidBlock, { diagram }),
      },
    })
}

// Singleton processor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _processor: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProcessor(): any {
  if (!_processor) _processor = buildProcessor()
  return _processor
}

export async function processMarkdown(content: string): Promise<ReactNode> {
  const result = await getProcessor().process(content)
  return result.result as ReactNode
}
