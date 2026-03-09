import { IsString, IsOptional } from 'class-validator'

export class CreateMeetingDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  scheduled_at?: string

  @IsOptional()
  @IsString()
  description?: string
}
