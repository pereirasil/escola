import { IsString, IsOptional, IsEmail, MinLength, IsNumber } from 'class-validator'

export class CreateTeacherDto {
  @IsString()
  name: string

  @IsString()
  document: string

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEmail()
  email?: string

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
  @IsNumber()
  class_id?: number
}
