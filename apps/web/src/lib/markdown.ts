import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import type { ReactNode } from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeReact from 'rehype-react'
import type { Root, Element, Text } from 'hast'
import type { Transformer } from 'unified'
import { MermaidBlock } from '@/components/preview/MermaidBlock'

// ---------------------------------------------------------------------------
// Custom rehype plugin: converts ```mermaid code blocks into a marker element
// that MermaidBlock picks up client-side.
// ---------------------------------------------------------------------------
function rehypeMermaid(): Transformer<Root> {
  return (tree: Root) => {
    visitNode(tree as unknown as HastParent)
  }
}

type HastParent = { type: string; children?: HastNode[]; tagName?: string; properties?: Record<string, unknown> }
type HastNode = HastParent & { value?: string }

function visitNode(node: HastParent) {
  if (!Array.isArray(node.children)) return

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i] as HastNode
    if (child.type === 'element' && child.tagName === 'pre') {
      const code = child.children?.[0] as HastNode | undefined
      const classes = (code?.properties?.['className'] as string[] | undefined) ?? []
      if (
        code?.type === 'element' &&
        code.tagName === 'code' &&
        classes.includes('language-mermaid')
      ) {
        const diagram = (code.children?.[0] as { value?: string } | undefined)?.value ?? ''
        node.children[i] = {
          type: 'element',
          tagName: 'mermaid-block',
          properties: { diagram },
          children: [],
        } as unknown as HastNode
        continue
      }
    }
    visitNode(child)
  }
}

// ---------------------------------------------------------------------------
// Build the processor once (expensive — shiki loads lazily on first call)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProcessor(): any {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex)
    .use(rehypeMermaid)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .use(rehypePrettyCode as any, {
      theme: { light: 'github-light', dark: 'github-dark' },
      keepBackground: true,
    })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
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

// Export types for external use
export type { Root, Element, Text }
