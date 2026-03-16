import { IsString, IsOptional } from 'class-validator'

export class CreateBankAccountDto {
  @IsString()
  bank_code: string

  @IsOptional()
  @IsString()
  bank_name?: string

  @IsString()
  agency: string

  @IsOptional()
  @IsString()
  agency_digit?: string

  @IsString()
  account: string

  @IsOptional()
  @IsString()
  account_digit?: string

  @IsOptional()
  @IsString()
  account_type?: string

  @IsString()
  beneficiary_name: string

  @IsString()
  document: string

  @IsOptional()
  @IsString()
  pix_key?: string
}
