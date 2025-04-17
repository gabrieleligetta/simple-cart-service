import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractRepositoryBase } from '../../libs/repo/abstact.repository';
import { DiscountEntity } from './discount.entity';

@Injectable()
export class DiscountRepository extends AbstractRepositoryBase<DiscountEntity> {
  constructor(
    @InjectRepository(DiscountEntity)
    repo: Repository<DiscountEntity>,
  ) {
    super(repo);
  }
}
