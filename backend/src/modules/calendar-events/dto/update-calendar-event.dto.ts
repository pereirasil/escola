import { IsString, IsOptional, IsArray } from 'class-validator'

export class UpdateCalendarEventDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  date?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  series?: string[]
}
