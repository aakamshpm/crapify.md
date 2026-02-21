// View modes for the editor layout
export type ViewMode = 'split' | 'editor-only' | 'preview-only'

// App color theme
export type Theme = 'light' | 'dark'

// Preview typography theme
export type PreviewTheme = 'github' | 'minimal'

// PDF export request (used by NestJS API)
export interface ExportPdfRequest {
  html: string
  title?: string
}

// PDF export response
export interface ExportPdfResponse {
  url: string
}
