import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { AbstractRepositoryBase } from '../../libs/repo/abstact.repository';

@Injectable()
export class UserRepository extends AbstractRepositoryBase<UserEntity> {
  constructor(@InjectRepository(UserEntity) repo: Repository<UserEntity>) {
    super(repo);
  }

  /* No need for a dedicated method anymore */
  async findByEmail(email: string) {
    return this.findBy('email', email.toLowerCase());
  }
}
