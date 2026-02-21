import { Module } from '@nestjs/common'
import { ExportModule } from './modules/export/export.module'

@Module({
  imports: [ExportModule],
})
export class AppModule {}
