import { IsNotEmpty, IsString } from 'class-validator'

export class RespondStudentMessageDto {
  @IsString()
  @IsNotEmpty()
  response: string
}
