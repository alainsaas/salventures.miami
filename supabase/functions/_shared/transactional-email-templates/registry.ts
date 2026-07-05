import type { ComponentType } from 'npm:react@18.3.1'
import { template as contactMessage } from './contact-message.tsx'

export interface TemplateEntry {
  // deno-lint-ignore no-explicit-any
  component: ComponentType<any>
  subject: string | ((data: Record<string, unknown>) => string)
  displayName?: string
  // deno-lint-ignore no-explicit-any
  previewData?: Record<string, any>
  to?: string | string[]
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contact-message': contactMessage,
}
