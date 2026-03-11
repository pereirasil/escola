import { IsNumber } from 'class-validator'

export class CreateEnrollmentDto {
  @IsNumber()
  student_id: number
}
