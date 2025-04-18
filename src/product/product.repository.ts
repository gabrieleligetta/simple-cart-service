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

  async onModuleInit() {
    console.log('Ensuring pg_trgm extension & product indexes…');

    // Enable the trigram extension (idempotent)
    await this.repo.manager.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // B‑Tree indexes for fast range/equality/sorting
    await this.repo.manager.query(
      `CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);`,
    );
    await this.repo.manager.query(
      `CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);`,
    );
    await this.repo.manager.query(
      `CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);`,
    );
    await this.repo.manager.query(
      `CREATE INDEX IF NOT EXISTS idx_products_created_at ON products("createdAt");`,
    );

    // GIN‑trigram indexes for ILIKE '%…%' substring searches
    await this.repo.manager.query(
      `CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);`,
    );
    await this.repo.manager.query(
      `CREATE INDEX IF NOT EXISTS idx_products_desc_trgm ON products USING gin (description gin_trgm_ops);`,
    );

    console.log('Product indexes are in place.');
  }
}
