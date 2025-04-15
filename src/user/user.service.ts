import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findByEmail(email);
  }

  findById(id: number): Promise<UserEntity | null> {
    return this.userRepo.findById(id);
  }

  createUser(email: string, hashedPassword: string): Promise<UserEntity> {
    return this.userRepo.createUser(email, hashedPassword);
  }

  getAllUsers(): Promise<UserEntity[]> {
    return this.userRepo.getAllUsers();
  }
}
