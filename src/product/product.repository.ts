// src/product/product.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductEntity } from './product.entity';
import { AbstractRepositoryBase } from '../../libs/repo/abstact.repository';

@Injectable()
export class ProductRepository extends AbstractRepositoryBase<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity) repo: Repository<ProductEntity>,
  ) {
    super(repo);
  }

  /** Example of a domain‑specific helper */
  findByName(name: string) {
    return this.findBy('name', name);
  }
}
