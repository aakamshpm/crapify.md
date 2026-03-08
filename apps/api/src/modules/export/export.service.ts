import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import puppeteer, { Browser } from 'puppeteer'
import { ExportPdfRequestDto } from './dto/export-pdf-request.dto'
import { buildHtmlShell } from './html-shell'

@Injectable()
export class ExportService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExportService.name)
  private browser: Browser | null = null

  // ---------- Lifecycle ----------

  async onModuleInit(): Promise<void> {
    await this.launchBrowser()
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeBrowser()
  }

  // ---------- Browser management ----------

  private async launchBrowser(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      })

      // Restart browser if it crashes
      this.browser.on('disconnected', () => {
        this.logger.warn('Browser disconnected — restarting…')
        this.browser = null
        this.launchBrowser().catch((err) => {
          this.logger.error('Failed to restart browser', err)
        })
      })

      this.logger.log('Puppeteer browser launched')
    } catch (err) {
      this.logger.error('Failed to launch Puppeteer browser', err)
      throw err
    }
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      // Remove listener so the disconnect handler doesn't try to restart
      this.browser.removeAllListeners('disconnected')
      await this.browser.close()
      this.browser = null
      this.logger.log('Puppeteer browser closed')
    }
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.connected) {
      this.logger.warn('Browser not available — relaunching…')
      await this.launchBrowser()
    }
    return this.browser!
  }

  // ---------- PDF export ----------

  async exportPdf(dto: ExportPdfRequestDto): Promise<Buffer> {
    const { markdown } = dto

    // 1. Render markdown to HTML via the shared pipeline
    const { markdownToHtml } = await import('@crapify/markdown')
    const bodyHtml = await markdownToHtml(markdown)

    // 2. Extract title from first h1
    const title = extractTitle(markdown)

    // 3. Build full HTML document
    const fullHtml = buildHtmlShell(bodyHtml, title)

    // 4. Generate PDF
    const browser = await this.getBrowser()
    const page = await browser.newPage()

    try {
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' })

      // Wait for Mermaid rendering to finish (set by the inline script)
      await page.waitForFunction('window.__MERMAID_DONE__ === true', {
        timeout: 15000,
      }).catch(() => {
        this.logger.warn('Mermaid rendering timed out — continuing without it')
      })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      })

      return Buffer.from(pdfBuffer)
    } finally {
      await page.close()
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extracts the first `# heading` from raw markdown for the PDF title. */
function extractTitle(markdown: string): string {
  const match = /^#\s+(.+)$/m.exec(markdown)
  return match ? match[1]!.trim() : 'Untitled'
}
