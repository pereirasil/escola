import { IsIn } from 'class-validator'

export class UpdateStudentStatusDto {
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive'
}
