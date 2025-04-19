// src/product/product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('products')
// B‑Tree indexes (default) for fast range & equality on price & stock:
@Index('IDX_PRODUCTS_PRICE', ['price'])
@Index('IDX_PRODUCTS_STOCK', ['stock'])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // For prefix or exact matches on name:
  @Column({ length: 120 })
  @Index('IDX_PRODUCTS_NAME') // B‑Tree on name for queries like name_eq=Foo or name_startsWith=Foo%
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  updatedAt: Date;
}
