import { IsNotEmpty, IsString } from 'class-validator'

export class CreateStudentMessageDto {
  @IsString()
  @IsNotEmpty()
  subject: string

  @IsString()
  @IsNotEmpty()
  message: string
}
