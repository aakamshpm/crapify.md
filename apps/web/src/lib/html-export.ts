// ---------------------------------------------------------------------------
// Builds a self-contained HTML document for the "Download as HTML" feature.
// Uses CDN links for KaTeX and Mermaid, and respects prefers-color-scheme
// for both the page theme and Shiki dual code-block themes.
// ---------------------------------------------------------------------------

const KATEX_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css'
const MERMAID_JS = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'

export function buildExportHtml(bodyHtml: string, title: string): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>

  <!-- KaTeX -->
  <link rel="stylesheet" href="${KATEX_CSS}" />

  <!-- Mermaid -->
  <script src="${MERMAID_JS}"></script>

  <style>
    /* ---- CSS custom properties — light & dark ---- */
    :root {
      --background: #ffffff;
      --foreground: #0a0a0f;
      --muted-bg: #f3f4f6;
      --muted-fg: #6b7280;
      --border: #e5e7eb;
      --link: #2563eb;
      --blockquote-border: #d1d5db;
      --blockquote-bg: #f9fafb;
      --blockquote-fg: #4b5563;
      --table-header-bg: #f3f4f6;
      --table-stripe-bg: #f9fafb;
      --code-inline-bg: #f3f4f6;
      --code-inline-fg: #0a0a0f;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --background: #0a0a0f;
        --foreground: #f8f8fa;
        --muted-bg: #1a1a2e;
        --muted-fg: #9ca3af;
        --border: #2a2a3e;
        --link: #60a5fa;
        --blockquote-border: #3a3a5e;
        --blockquote-bg: #13131f;
        --blockquote-fg: #9ca3af;
        --table-header-bg: #1a1a2e;
        --table-stripe-bg: #13131f;
        --code-inline-bg: #1a1a2e;
        --code-inline-fg: #f8f8fa;
      }
    }

    /* ---- Reset & Base ---- */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html {
      font-size: 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, sans-serif;
      color: var(--foreground);
      background: var(--background);
      line-height: 1.75;
      padding: 2rem 1rem;
    }

    .content {
      max-width: 720px;
      margin: 0 auto;
    }

    /* ---- Typography ---- */
    .content h1 { font-size: 2em;   font-weight: 700; margin: 1.5em 0 0.5em; line-height: 1.2; }
    .content h2 { font-size: 1.5em; font-weight: 600; margin: 1.4em 0 0.4em; line-height: 1.3; }
    .content h3 { font-size: 1.25em;font-weight: 600; margin: 1.3em 0 0.3em; line-height: 1.4; }
    .content h4 { font-size: 1.1em; font-weight: 600; margin: 1.2em 0 0.3em; }
    .content h5,
    .content h6 { font-size: 1em;   font-weight: 600; margin: 1em 0 0.3em; }
    .content h1:first-child { margin-top: 0; }

    /* heading anchor links (rehype-autolink-headings wraps heading in <a>) */
    .content h1 a,
    .content h2 a,
    .content h3 a,
    .content h4 a,
    .content h5 a,
    .content h6 a {
      color: inherit;
      text-decoration: none;
    }
    .content h1 a:hover,
    .content h2 a:hover,
    .content h3 a:hover { text-decoration: underline; }

    .content p { margin: 1em 0; }

    .content a { color: var(--link); text-decoration: underline; }

    .content strong { font-weight: 700; }
    .content em { font-style: italic; }
    .content del { text-decoration: line-through; }

    .content ul,
    .content ol { margin: 1em 0; padding-left: 1.75em; }
    .content li { margin: 0.3em 0; }
    .content li > ul,
    .content li > ol { margin: 0.25em 0; }

    /* GFM task lists */
    .content input[type="checkbox"] { margin-right: 0.4em; }

    .content blockquote {
      border-left: 4px solid var(--blockquote-border);
      padding: 0.5em 1em;
      margin: 1em 0;
      color: var(--blockquote-fg);
      background: var(--blockquote-bg);
      border-radius: 0 0.25rem 0.25rem 0;
    }

    .content hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 2em 0;
    }

    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 0.375rem;
    }

    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      font-size: 0.875em;
    }

    .content th,
    .content td {
      border: 1px solid var(--border);
      padding: 0.5em 0.75em;
      text-align: left;
    }

    .content th {
      background: var(--table-header-bg);
      font-weight: 600;
    }

    .content tr:nth-child(even) td {
      background: var(--table-stripe-bg);
    }

    /* ---- Inline code ---- */
    .content :not(pre) > code {
      background: var(--code-inline-bg);
      color: var(--code-inline-fg);
      padding: 0.15em 0.4em;
      border-radius: 0.25rem;
      font-size: 0.875em;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    /* ---- Code blocks (rehype-pretty-code / Shiki dual-theme) ---- */
    [data-rehype-pretty-code-figure] {
      margin: 1.5em 0;
    }

    [data-rehype-pretty-code-figure] pre {
      overflow-x: auto;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      padding: 1rem 1.25rem;
      font-size: 0.8125rem;
      line-height: 1.7;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    [data-rehype-pretty-code-figure] pre code {
      background: transparent;
      padding: 0;
      border-radius: 0;
      font-size: inherit;
      color: inherit;
    }

    /* Show the correct Shiki theme based on system preference */
    @media (prefers-color-scheme: light) {
      [data-rehype-pretty-code-figure] pre[data-theme="dark"]  { display: none; }
      [data-rehype-pretty-code-figure] pre[data-theme="light"] { display: block; }
    }

    @media (prefers-color-scheme: dark) {
      [data-rehype-pretty-code-figure] pre[data-theme="light"] { display: none; }
      [data-rehype-pretty-code-figure] pre[data-theme="dark"]  { display: block; }
    }

    /* ---- KaTeX ---- */
    .katex-display {
      overflow-x: auto;
      overflow-y: hidden;
      padding: 0.5rem 0;
    }

    /* ---- Mermaid ---- */
    .mermaid-rendered {
      display: flex;
      justify-content: center;
      padding: 1rem 0;
    }

    .mermaid-rendered svg {
      max-width: 100%;
      height: auto;
    }

    .mermaid-fallback {
      margin: 1.5em 0;
    }

    .mermaid-fallback pre {
      overflow-x: auto;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      padding: 1rem 1.25rem;
      font-size: 0.8125rem;
      line-height: 1.7;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background: var(--muted-bg);
      color: var(--foreground);
    }

    /* ---- Print ---- */
    @media print {
      body { padding: 0; }
      .content { max-width: none; }
    }
  </style>
</head>
<body>
  <div class="content">
    ${bodyHtml}
  </div>

  <script>
    (async function () {
      const TIMEOUT = 5000
      const blocks = document.querySelectorAll('mermaid-block')
      if (!blocks.length) return

      // Pick theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const mermaidTheme = prefersDark ? 'dark' : 'default'

      try {
        mermaid.initialize({ startOnLoad: false, theme: mermaidTheme })
      } catch {
        blocks.forEach(fallback)
        return
      }

      let i = 0
      for (const el of blocks) {
        const diagram = el.getAttribute('diagram') || ''
        if (!diagram.trim()) { fallback(el); i++; continue }

        try {
          const result = await Promise.race([
            mermaid.render('mermaid-' + i, diagram),
            new Promise(function (_, reject) {
              setTimeout(function () { reject(new Error('timeout')) }, TIMEOUT)
            }),
          ])
          const wrapper = document.createElement('div')
          wrapper.className = 'mermaid-rendered'
          wrapper.innerHTML = result.svg
          el.replaceWith(wrapper)
        } catch {
          fallback(el)
        }
        i++
      }

      function fallback(el) {
        const diag = el.getAttribute('diagram') || ''
        const div = document.createElement('div')
        div.className = 'mermaid-fallback'
        const pre = document.createElement('pre')
        const code = document.createElement('code')
        code.textContent = diag
        pre.appendChild(code)
        div.appendChild(pre)
        el.replaceWith(div)
      }
    })()
  </script>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
