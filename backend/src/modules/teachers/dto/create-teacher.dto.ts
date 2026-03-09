import { IsString, IsOptional, IsEmail, MinLength, IsArray, IsNumber } from 'class-validator'

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
  subject?: string

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  class_ids?: number[]
}
