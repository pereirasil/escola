import { Injectable } from '@nestjs/common'
import * as Handlebars from 'handlebars'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class MailTemplatesService {
  private readonly templatesDir = path.join(__dirname, 'templates')
  private cache = new Map<string, Handlebars.TemplateDelegate>()

  render(templateName: string, data: Record<string, unknown>): string {
    const layout = this.compile('layout')
    const content = this.compile(templateName)
    const merged = {
      schoolName: (data.schoolName as string) ?? 'Sistema de Gestão Escolar',
      subject: (data.subject as string) ?? '',
      ...data,
      content: content(data),
    }
    return layout(merged)
  }

  private compile(name: string): Handlebars.TemplateDelegate {
    const cached = this.cache.get(name)
    if (cached) return cached

    const filePath = path.join(this.templatesDir, `${name}.hbs`)
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template não encontrado: ${name}`)
    }
    const source = fs.readFileSync(filePath, 'utf-8')
    const template = Handlebars.compile(source)
    this.cache.set(name, template)
    return template
  }
}
