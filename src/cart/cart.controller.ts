import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/libs/guards/jwt-guard';
import { CartService } from './cart.service';
import { UserRequest } from '../auth/libs/requests/user.request';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async add(@Body() { productId, quantity }, @Req() req: UserRequest) {
    return this.cartService.addProduct(req.user, productId, quantity);
  }

  @Post('remove')
  async remove(@Body() { productId, quantity }, @Req() req: UserRequest) {
    return this.cartService.removeProduct(req.user, productId, quantity);
  }

  @Post('discount')
  async applyDiscount(@Body() { code }, @Req() req: UserRequest) {
    return this.cartService.applyDiscount(req.user, code);
  }

  @Get()
  async getCart(@Req() req: UserRequest) {
    return this.cartService.viewCart(req.user);
  }
}
