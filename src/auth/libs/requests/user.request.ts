// src/types/express-request.interface.ts
import { Request } from 'express';
import { UserDto } from '../../../user/libs/dto/user.dto';

export interface UserRequest extends Request {
  user: UserDto;
}
