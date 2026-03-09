import { IsString, IsOptional, IsEmail, IsNumber } from 'class-validator'

export class CreateStudentDto {
  @IsString()
  name: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  document?: string

  @IsOptional()
  @IsString()
  birth_date?: string

  @IsOptional()
  @IsString()
  guardian_name?: string

  @IsOptional()
  @IsString()
  guardian_phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsNumber()
  class_id?: number
}
