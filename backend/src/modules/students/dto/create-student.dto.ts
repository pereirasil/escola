import { IsString, IsOptional, IsEmail, IsNumber, MinLength } from 'class-validator'

export class CreateStudentDto {
  @IsString()
  name: string

  /** CPF do aluno (opcional, nao usado para login). */
  @IsOptional()
  @IsString()
  document?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  birth_date?: string

  /** Nome do responsavel (obrigatorio). */
  @IsString()
  guardian_name: string

  @IsOptional()
  @IsString()
  guardian_phone?: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  neighborhood?: string

  @IsOptional()
  @IsString()
  street?: string

  @IsOptional()
  @IsString()
  number?: string

  @IsOptional()
  @IsString()
  complement?: string

  @IsOptional()
  @IsString()
  cep?: string

  /** CPF do responsavel (obrigatorio). Usado para login do responsavel. */
  @IsString()
  guardian_document: string

  /** Senha do responsavel. Obrigatoria apenas quando o responsavel sera criado (nao existe). */
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Senha do responsável deve ter no mínimo 6 caracteres' })
  guardian_password?: string

  @IsOptional()
  @IsNumber()
  class_id?: number

  @IsOptional()
  @IsNumber()
  monthly_fee?: number

  /** Dia do mês (1-31) de vencimento da mensalidade. */
  @IsOptional()
  @IsNumber()
  payment_due_day?: number

  /** Percentual de multa por atraso (ex: 2 para 2%). */
  @IsOptional()
  @IsNumber()
  late_fee_percentage?: number
}
