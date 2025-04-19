import { Role } from '../enums/roles.enum';

export class UserResponseDto {
  id: number;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
