import { IsString, IsOptional, IsNumber } from 'class-validator'

export class CreateScheduleDto {
  @IsNumber()
  class_id: number

  @IsNumber()
  teacher_id: number

  @IsNumber()
  subject_id: number

  @IsString()
  day_of_week: string

  @IsString()
  start_time: string

  @IsString()
  end_time: string

  @IsOptional()
  @IsString()
  room?: string
}
