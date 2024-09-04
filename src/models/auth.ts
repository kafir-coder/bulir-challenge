import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator'

export class LoginDto {
  @ValidateIf((o) => !o.nif)
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsNotEmpty()
  nif: string

  @IsNotEmpty()
  password: string
}
