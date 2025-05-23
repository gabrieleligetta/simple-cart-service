import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cartItem.entity';
import { CartRepository } from './repositories/cart.repository';
import { CartItemRepository } from './repositories/cartItem.repository';
import { CartService } from './cart.service';
import { Module } from '@nestjs/common';
import { ProductModule } from '../product/product.module';
import { DiscountModule } from '../discount/discount.module';
import { CartController } from './cart.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
    ProductModule,
    DiscountModule,
  ],
  controllers: [CartController],
  providers: [CartRepository, CartItemRepository, CartService],
  exports: [CartService],
})
export class CartModule {}
