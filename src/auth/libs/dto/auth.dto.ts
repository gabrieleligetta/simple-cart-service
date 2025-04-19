import { IsEmail, MinLength, MaxLength, IsString } from 'class-validator';

// Payload for POST /auth/register
export class RegisterDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}

// Payload for POST /auth/login
export class LoginDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
