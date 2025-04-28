import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AbstractRepositoryBase } from '../../../libs/repo/abstact.repository';
import { CartItemEntity } from '../entities/cartItem.entity';

@Injectable()
export class CartItemRepository extends AbstractRepositoryBase<CartItemEntity> {
  constructor(
    @InjectRepository(CartItemEntity)
    repo: Repository<CartItemEntity>,
    dataSource: DataSource,
  ) {
    super(repo, dataSource);
  }

  async findByCartAndProduct(
    cartId: number,
    productId: number,
  ): Promise<CartItemEntity | null> {
    return this.repo.findOne({
      where: {
        cart: { id: cartId },
        product: { id: productId },
      },
      relations: ['product', 'cart'],
    });
  }
}
