import { IsString, MinLength } from 'class-validator'

export class RefreshSessionDto {
  @IsString()
  @MinLength(32)
  refresh_token: string
}
