import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { ExportService } from './export.service'
import { ExportPdfRequestDto } from './dto/export-pdf-request.dto'

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('pdf')
  @HttpCode(HttpStatus.OK)
  async exportPdf(
    @Body() dto: ExportPdfRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.exportService.exportPdf(dto)

    // Extract a filename-safe title from the first h1
    const title = extractFilename(dto.markdown)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${title}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    })

    res.send(pdfBuffer)
  }
}

function extractFilename(markdown: string): string {
  const match = /^#\s+(.+)$/m.exec(markdown)
  const raw = match ? match[1]!.trim() : 'document'
  // Sanitise for filename: keep alphanumeric, spaces, hyphens, underscores
  return raw.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'document'
}
