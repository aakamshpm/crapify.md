import type { Root } from 'hast'
import type { Transformer } from 'unified'

// ---------------------------------------------------------------------------
// Custom rehype plugin: converts ```mermaid code blocks into a <mermaid-block>
// marker element. In the browser, a React component picks this up. In the
// backend export shell, a client-side Mermaid script renders it.
// ---------------------------------------------------------------------------

type HastParent = {
  type: string
  children?: HastNode[]
  tagName?: string
  properties?: Record<string, unknown>
}
type HastNode = HastParent & { value?: string }

function visitNode(node: HastParent) {
  if (!Array.isArray(node.children)) return

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i] as HastNode
    if (child.type === 'element' && child.tagName === 'pre') {
      const code = child.children?.[0] as HastNode | undefined
      const classes =
        (code?.properties?.['className'] as string[] | undefined) ?? []
      if (
        code?.type === 'element' &&
        code.tagName === 'code' &&
        classes.includes('language-mermaid')
      ) {
        const diagram =
          (code.children?.[0] as { value?: string } | undefined)?.value ?? ''
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

export function rehypeMermaid(): Transformer<Root> {
  return (tree: Root) => {
    visitNode(tree as unknown as HastParent)
  }
}
