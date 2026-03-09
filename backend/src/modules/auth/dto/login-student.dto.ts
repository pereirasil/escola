import { IsString, MinLength } from 'class-validator'

export class LoginStudentDto {
  @IsString()
  cpf: string

  @IsString()
  @MinLength(1)
  password: string
}
