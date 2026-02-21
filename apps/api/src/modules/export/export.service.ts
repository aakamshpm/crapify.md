import { Injectable } from '@nestjs/common'
import { ExportPdfRequestDto } from './dto/export-pdf-request.dto'

@Injectable()
export class ExportService {
  // eslint-disable-next-line @typescript-eslint/require-await
  async exportPdf(_dto: ExportPdfRequestDto): Promise<{ message: string }> {
    // TODO: implement Puppeteer PDF generation
    // const browser = await puppeteer.launch()
    // const page = await browser.newPage()
    // await page.setContent(dto.html, { waitUntil: 'networkidle0' })
    // const pdf = await page.pdf({ format: 'A4', printBackground: true })
    // await browser.close()
    // return pdf
    return { message: 'PDF export not yet implemented. Puppeteer will be wired here.' }
  }
}
