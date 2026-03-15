import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  subject: string

  @IsNumber()
  @IsOptional()
  student_id?: number

  @IsNumber()
  @IsOptional()
  teacher_id?: number

  @IsString()
  @IsOptional()
  initial_message?: string
}
