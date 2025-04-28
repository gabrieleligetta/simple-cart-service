import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AbstractRepositoryBase } from '../../libs/repo/abstact.repository';
import { DiscountEntity } from './discount.entity';

@Injectable()
export class DiscountRepository extends AbstractRepositoryBase<DiscountEntity> {
  constructor(
    @InjectRepository(DiscountEntity)
    repo: Repository<DiscountEntity>,
    dataSource: DataSource,
  ) {
    super(repo, dataSource);
  }
}
