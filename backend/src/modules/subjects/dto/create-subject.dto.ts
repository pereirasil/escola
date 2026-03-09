import { IsString, IsOptional, IsNumber } from 'class-validator'

export class CreateSubjectDto {
  @IsString()
  name: string

  @IsOptional()
  @IsNumber()
  duration_minutes?: number
}
