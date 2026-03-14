import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  subject: string

  @IsNumber()
  @IsOptional()
  student_id?: number

  @IsString()
  @IsOptional()
  initial_message?: string
}
