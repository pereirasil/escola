import { IsInt } from 'class-validator'

export class ChooseSchoolDto {
  @IsInt()
  school_id: number
}
