// src/cart/cart.controller.ts

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/libs/guards/jwt.guard';
import { CartService } from './cart.service';
import { UserRequest } from '../auth/libs/requests/user.request';
import {
  AddToCartDto,
  ApplyDiscountDto,
  RemoveFromCartDto,
} from './libs/cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /** Add product to cart */
  @Post('add')
  @HttpCode(HttpStatus.OK)
  add(@Body() dto: AddToCartDto, @Req() req: UserRequest) {
    return this.cartService.addProduct(req.user, dto.productId, dto.quantity);
  }

  /** Remove product from cart (quantity optional) */
  @Post('remove')
  @HttpCode(HttpStatus.OK)
  remove(@Body() dto: RemoveFromCartDto, @Req() req: UserRequest) {
    return this.cartService.removeProduct(
      req.user,
      dto.productId,
      dto.quantity,
    );
  }

  /** Apply a discount code */
  @Post('add/discount')
  @HttpCode(HttpStatus.OK)
  applyDiscount(@Body() dto: ApplyDiscountDto, @Req() req: UserRequest) {
    return this.cartService.applyDiscount(req.user, dto.code);
  }

  /** Remove the active discount */
  @Post('remove/discount')
  @HttpCode(HttpStatus.OK)
  removeDiscount(@Req() req: UserRequest) {
    return this.cartService.removeDiscount(req.user);
  }

  /** View the cart */
  @Get()
  @HttpCode(HttpStatus.OK)
  getCart(@Req() req: UserRequest) {
    return this.cartService.viewCart(req.user);
  }
}
