import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async createUser(email: string, hashedPassword: string): Promise<UserEntity> {
    const newUser = this.repo.create({ email, password: hashedPassword });
    return this.repo.save(newUser);
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return this.repo.find();
  }
}
