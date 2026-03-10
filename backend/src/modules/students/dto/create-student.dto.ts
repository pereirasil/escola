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
  state?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  neighborhood?: string

  @IsOptional()
  @IsString()
  street?: string

  @IsOptional()
  @IsString()
  number?: string

  @IsOptional()
  @IsString()
  complement?: string

  @IsOptional()
  @IsString()
  cep?: string

  @IsOptional()
  @IsString()
  guardian_document?: string

  @IsOptional()
  @IsNumber()
  class_id?: number
}
