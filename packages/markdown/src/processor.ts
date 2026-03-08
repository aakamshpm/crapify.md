import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import { rehypeMermaid } from './rehype-mermaid.js'

// ---------------------------------------------------------------------------
// createBaseProcessor — returns a unified chain up to (but NOT including) the
// final output step. Consumers attach their own:
//   • rehype-react  (frontend — returns ReactNode)
//   • rehype-stringify (backend — returns HTML string)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createBaseProcessor(): any {
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
}

// ---------------------------------------------------------------------------
// markdownToHtml — full pipeline that returns an HTML string.
// Used by the backend for PDF export.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _htmlProcessor: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getHtmlProcessor(): any {
  if (!_htmlProcessor) {
    _htmlProcessor = createBaseProcessor().use(rehypeStringify, {
      allowDangerousHtml: false,
    })
  }
  return _htmlProcessor
}

export async function markdownToHtml(content: string): Promise<string> {
  const result = await getHtmlProcessor().process(content)
  return String(result)
}
