import { IsNumber, IsString, IsOptional } from 'class-validator'

export class CreatePaymentDto {
  @IsNumber()
  student_id: number

  @IsNumber()
  amount: number

  @IsOptional()
  @IsString()
  due_date?: string

  @IsOptional()
  @IsString()
  status?: string
}
