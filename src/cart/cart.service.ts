import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartRepository } from './repositories/cart.repository';
import { UserEntity } from '../user/user.entity';
import { DiscountEntity, DiscountType } from '../discount/discount.entity';
import { CartItemRepository } from './repositories/cartItem.repository';
import { DiscountService } from '../discount/discount.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
  constructor(
    private cartRepository: CartRepository,
    private cartItemRepository: CartItemRepository,
    private productService: ProductService,
    private discountService: DiscountService,
  ) {}

  async addProduct(user: UserEntity, productId: number, quantity: number) {
    const cart = await this.getOrCreateUserCart(user);
    const product = await this.productService.findOne(productId);
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < quantity)
      throw new BadRequestException('Insufficient stock');

    let item = await this.cartItemRepository.findByCartAndProduct(
      cart.id,
      productId,
    );
    if (item) {
      if (product.stock < item.quantity + quantity)
        throw new BadRequestException(
          'Insufficient stock for increased quantity',
        );
      item.quantity += quantity;
      await this.cartItemRepository.update(item.id, {
        quantity: item.quantity,
      });
    } else {
      await this.cartItemRepository.create({
        cart,
        product,
        quantity,
      });
    }

    return this.cartRepository.findByUserId(user.id);
  }

  async removeProduct(user: UserEntity, productId: number, quantity?: number) {
    const cart = await this.getOrCreateUserCart(user);
    const item = await this.cartItemRepository.findByCartAndProduct(
      cart.id,
      productId,
    );
    if (!item) throw new NotFoundException('Product not in cart');

    if (!quantity || item.quantity <= quantity) {
      await this.cartItemRepository.delete(item.id);
    } else {
      item.quantity -= quantity;
      await this.cartItemRepository.update(item.id, {
        quantity: item.quantity,
      });
    }

    return this.cartRepository.findByUserId(user.id);
  }

  async applyDiscount(user: UserEntity, code: string) {
    const cart = await this.getOrCreateUserCart(user);
    const discount = await this.discountService.findByCode(code);
    if (!discount)
      throw new NotFoundException('Discount not found or inactive');
    if (discount.expiration && discount.expiration < new Date())
      throw new BadRequestException('Discount expired');

    cart.discount = discount;
    return this.cartRepository.update(cart.id, { discount });
  }

  async viewCart(user: UserEntity) {
    const cart = await this.getOrCreateUserCart(user);
    const items = cart.items.map((item) => ({
      productId: item.product.id,
      description: item.product.description,
      unitPrice: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const discountAmount = this.calculateDiscount(subtotal, cart.discount);
    const total = subtotal - discountAmount;

    return {
      items,
      subtotal,
      discount: discountAmount,
      total,
    };
  }

  private async getOrCreateUserCart(user: UserEntity) {
    let cart = await this.cartRepository.findByUserId(user.id);
    if (!cart) {
      cart = await this.cartRepository.create({ user, items: [] });
    }
    return cart;
  }

  private calculateDiscount(
    subtotal: number,
    discount?: DiscountEntity,
  ): number {
    if (!discount) return 0;

    switch (discount.type) {
      case DiscountType.PERCENTAGE:
        return subtotal * (discount.amount / 100);
      case DiscountType.FIXED:
        return Math.min(discount.amount, subtotal);
      default:
        return 0;
    }
  }
}
