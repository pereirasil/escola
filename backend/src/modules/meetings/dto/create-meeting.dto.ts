import { IsString, IsOptional, IsNumber } from 'class-validator'

export class CreateMeetingDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  scheduled_at?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  class_id?: number
}
