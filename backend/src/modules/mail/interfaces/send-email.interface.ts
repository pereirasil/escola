export interface MailAttachment {
  filename: string
  /** Buffer ou objeto serializado { type: 'Buffer', data: number[] } após JSON */
  content?: Buffer | { type: string; data: number[] }
  path?: string
}

export interface SendEmailPayload {
  to: string
  subject: string
  template: string
  data: Record<string, unknown>
  attachments?: MailAttachment[]
  schoolId?: number
}
