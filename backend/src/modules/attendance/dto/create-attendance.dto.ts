import { IsNumber, IsString, IsOptional } from 'class-validator'

export class CreateAttendanceDto {
  @IsNumber()
  aluno_id: number

  @IsNumber()
  turma_id: number

  @IsNumber()
  materia_id: number

  @IsOptional()
  @IsNumber()
  teacher_id?: number

  @IsString()
  data: string

  @IsString()
  aula: string

  @IsString()
  status: string

  @IsOptional()
  @IsString()
  observacao?: string
}
