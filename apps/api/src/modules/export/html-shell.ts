// ---------------------------------------------------------------------------
// Builds a full HTML document shell that Puppeteer renders to PDF.
// Always uses a print-optimized light theme. Loads KaTeX CSS + Mermaid JS
// from CDN so the headless browser can render math and diagrams.
// ---------------------------------------------------------------------------

const KATEX_CSS =
  'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css'

const MERMAID_JS =
  'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'

/**
 * Wraps an HTML fragment (output of `markdownToHtml`) in a full document
 * with styles, fonts, KaTeX, and Mermaid support.
 */
export function buildHtmlShell(bodyHtml: string, title: string): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>

  <!-- KaTeX -->
  <link rel="stylesheet" href="${KATEX_CSS}" />

  <!-- Mermaid (loaded before body so it's available for init) -->
  <script src="${MERMAID_JS}"></script>

  <style>
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
      color: #1a1a2e;
      background: #fff;
      line-height: 1.75;
      padding: 2rem 0;
    }

    .content {
      max-width: 720px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    /* ---- Typography (prose-like) ---- */
    .content h1 { font-size: 2em; font-weight: 700; margin: 1.5em 0 0.5em; line-height: 1.2; }
    .content h2 { font-size: 1.5em; font-weight: 600; margin: 1.4em 0 0.4em; line-height: 1.3; }
    .content h3 { font-size: 1.25em; font-weight: 600; margin: 1.3em 0 0.3em; line-height: 1.4; }
    .content h4 { font-size: 1.1em; font-weight: 600; margin: 1.2em 0 0.3em; }
    .content h5, .content h6 { font-size: 1em; font-weight: 600; margin: 1em 0 0.3em; }
    .content h1:first-child { margin-top: 0; }

    .content p { margin: 1em 0; }

    .content a { color: #2563eb; text-decoration: underline; }

    .content strong { font-weight: 700; }
    .content em { font-style: italic; }

    .content ul, .content ol { margin: 1em 0; padding-left: 1.75em; }
    .content li { margin: 0.25em 0; }
    .content li > ul, .content li > ol { margin: 0.25em 0; }

    .content blockquote {
      border-left: 4px solid #d1d5db;
      padding: 0.5em 1em;
      margin: 1em 0;
      color: #4b5563;
      background: #f9fafb;
    }

    .content hr {
      border: none;
      border-top: 1px solid #e5e7eb;
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

    .content th, .content td {
      border: 1px solid #d1d5db;
      padding: 0.5em 0.75em;
      text-align: left;
    }

    .content th {
      background: #f3f4f6;
      font-weight: 600;
    }

    .content tr:nth-child(even) {
      background: #f9fafb;
    }

    /* ---- Inline code ---- */
    .content :not(pre) > code {
      background: #f3f4f6;
      color: #1a1a2e;
      padding: 0.15em 0.4em;
      border-radius: 0.25rem;
      font-size: 0.875em;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    /* ---- Code blocks (rehype-pretty-code) ---- */
    [data-rehype-pretty-code-figure] {
      margin: 1.5em 0;
    }

    [data-rehype-pretty-code-figure] pre {
      overflow-x: auto;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
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

    /* Force light theme for code blocks */
    [data-rehype-pretty-code-figure] pre[data-theme="dark"] { display: none; }
    [data-rehype-pretty-code-figure] pre[data-theme="light"] { display: block; }

    /* ---- KaTeX overrides ---- */
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
      border: 1px solid #e5e7eb;
      padding: 1rem 1.25rem;
      font-size: 0.8125rem;
      line-height: 1.7;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background: #f9fafb;
      color: #1a1a2e;
    }

    /* ---- Print ---- */
    @media print {
      body { padding: 0; }
      .content { max-width: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="content">
    ${bodyHtml}
  </div>

  <script>
    // Render all <mermaid-block> elements
    (async function () {
      const TIMEOUT = 5000;
      const blocks = document.querySelectorAll('mermaid-block');
      if (!blocks.length) {
        window.__MERMAID_DONE__ = true;
        return;
      }

      try {
        mermaid.initialize({ startOnLoad: false, theme: 'default' });
      } catch {
        // If mermaid failed to init, fall back for all blocks
        blocks.forEach(function (el) { fallback(el); });
        window.__MERMAID_DONE__ = true;
        return;
      }

      let done = 0;
      for (const el of blocks) {
        const diagram = el.getAttribute('diagram') || '';
        if (!diagram.trim()) { fallback(el); done++; continue; }

        try {
          const id = 'mermaid-' + done;
          const result = await Promise.race([
            mermaid.render(id, diagram),
            new Promise(function (_, reject) {
              setTimeout(function () { reject(new Error('timeout')); }, TIMEOUT);
            }),
          ]);
          const wrapper = document.createElement('div');
          wrapper.className = 'mermaid-rendered';
          wrapper.innerHTML = result.svg;
          el.replaceWith(wrapper);
        } catch {
          fallback(el);
        }
        done++;
      }

      window.__MERMAID_DONE__ = true;

      function fallback(el) {
        var diag = el.getAttribute('diagram') || '';
        var div = document.createElement('div');
        div.className = 'mermaid-fallback';
        var pre = document.createElement('pre');
        var code = document.createElement('code');
        code.textContent = diag;
        pre.appendChild(code);
        div.appendChild(pre);
        el.replaceWith(div);
      }
    })();
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
