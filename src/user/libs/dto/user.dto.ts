import { IsEmail, IsNotEmpty } from 'class-validator';
import { Role } from '../enums/roles.enum';

export class UserDto {
  id: number;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
