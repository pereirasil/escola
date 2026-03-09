import { IsString, IsOptional, IsEmail, IsNumber, MinLength } from 'class-validator'

export class CreateStudentDto {
  @IsString()
  name: string

  @IsString()
  document: string

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string

  @IsOptional()
  @IsEmail()
  email?: string

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
