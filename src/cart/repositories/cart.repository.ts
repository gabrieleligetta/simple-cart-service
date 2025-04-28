import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CartEntity } from '../entities/cart.entity';
import { AbstractRepositoryBase } from '../../../libs/repo/abstact.repository';

@Injectable()
export class CartRepository extends AbstractRepositoryBase<CartEntity> {
  constructor(
    @InjectRepository(CartEntity)
    repo: Repository<CartEntity>,
    dataSource: DataSource,
  ) {
    super(repo, dataSource);
  }

  async findByUserId(userId: number): Promise<CartEntity | null> {
    return this.repo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'discount', 'user'],
    });
  }
}
