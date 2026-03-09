import { IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Senha atual é obrigatória' })
  currentPassword: string

  @IsString()
  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  newPassword: string
}
