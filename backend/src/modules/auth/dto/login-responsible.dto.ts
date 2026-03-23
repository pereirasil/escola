import { IsString, MinLength } from 'class-validator'

export class LoginResponsibleDto {
  @IsString()
  cpf: string

  @IsString()
  @MinLength(1)
  password: string
}
