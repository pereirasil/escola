import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ChooseStudentDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  student_id: number
}
