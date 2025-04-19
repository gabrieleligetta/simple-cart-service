import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDto {
  id: number;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
