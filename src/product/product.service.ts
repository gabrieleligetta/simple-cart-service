// src/product/product.service.ts
import {
  HttpCode,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto, UpdateProductDto } from './libs/dto/product.dto';
import { PaginatedQuery } from '../../libs/dto/paginatedQuery.dto';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductService {
  constructor(private readonly products: ProductRepository) {}

  /* CRUD wrappers */

  create(dto: CreateProductDto) {
    return this.products.create(dto);
  }

  list(query: PaginatedQuery) {
    // Allow filtering by name or price via query‑string
    return this.products.listPaginated(query, [
      'name',
      'price',
      'description',
      'stock',
    ]);
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.products.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id=${id} not found`);
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const updated = await this.products.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Product with id=${id} not found`);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.products.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Product with id=${id} not found`);
    }
    // nothing to return
  }
}
