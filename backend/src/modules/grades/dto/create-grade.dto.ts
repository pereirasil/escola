import { IsNumber, IsString } from 'class-validator'

export class CreateGradeDto {
  @IsNumber()
  aluno_id: number

  @IsNumber()
  turma_id: number

  @IsNumber()
  materia_id: number

  @IsNumber()
  nota: number

  @IsString()
  bimestre: string
}
