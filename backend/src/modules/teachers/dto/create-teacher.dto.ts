import { IsString, IsOptional, IsEmail } from 'class-validator'

export class CreateTeacherDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  document?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  subject?: string
}
