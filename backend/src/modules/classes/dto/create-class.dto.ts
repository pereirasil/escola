import { IsString, IsOptional, IsNumber } from 'class-validator'

export class CreateClassDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  grade?: string

  @IsOptional()
  @IsString()
  shift?: string

  @IsOptional()
  @IsString()
  room?: string

  @IsOptional()
  @IsString()
  school_year?: string

  @IsOptional()
  @IsNumber()
  teacher_id?: number
}
