import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ExportService } from './export.service'
import { ExportPdfRequestDto } from './dto/export-pdf-request.dto'

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('pdf')
  @HttpCode(HttpStatus.OK)
  async exportPdf(@Body() dto: ExportPdfRequestDto): Promise<{ message: string }> {
    // Puppeteer implementation will be added in a future phase
    return this.exportService.exportPdf(dto)
  }
}
