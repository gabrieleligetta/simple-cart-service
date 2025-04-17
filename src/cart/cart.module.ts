import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cartItem.entity';
import { CartRepository } from './repositories/cart.repository';
import { CartItemRepository } from './repositories/cartItem.repository';
import { CartService } from './cart.service';
import { Module } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { DiscountService } from '../discount/discount.service';
import { ProductRepository } from '../product/product.repository';
import { DiscountRepository } from '../discount/discount.repository';
import { ProductModule } from '../product/product.module';
import { DiscountModule } from '../discount/discount.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
    ProductModule,
    DiscountModule,
  ],
  providers: [CartRepository, CartItemRepository, CartService],
  exports: [CartService],
})
export class CartModule {}
