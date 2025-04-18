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
import { JwtAuthGuard } from '../auth/libs/guards/jwt-guard';
import { CartService } from './cart.service';
import { UserRequest } from '../auth/libs/requests/user.request';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async add(@Body() { productId, quantity }, @Req() req: UserRequest) {
    return this.cartService.addProduct(req.user, productId, quantity);
  }

  @Post('remove')
  @HttpCode(HttpStatus.OK)
  async remove(@Body() { productId, quantity }, @Req() req: UserRequest) {
    return this.cartService.removeProduct(req.user, productId, quantity);
  }

  @Post('add/discount')
  @HttpCode(HttpStatus.OK)
  async applyDiscount(@Body() { code }, @Req() req: UserRequest) {
    return this.cartService.applyDiscount(req.user, code);
  }

  @Post('remove/discount/')
  @HttpCode(HttpStatus.OK)
  async removeDiscount(@Req() req: UserRequest) {
    return this.cartService.removeDiscount(req.user);
  }

  @Get()
  async getCart(@Req() req: UserRequest) {
    return this.cartService.viewCart(req.user);
  }
}
