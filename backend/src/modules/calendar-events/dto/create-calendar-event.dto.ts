import { IsString, IsOptional, IsArray } from 'class-validator'

export class CreateCalendarEventDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  date: string

  @IsArray()
  @IsString({ each: true })
  series: string[]
}
