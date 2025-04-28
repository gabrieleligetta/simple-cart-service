import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartRepository } from './repositories/cart.repository';
import { UserEntity } from '../user/user.entity';
import { DiscountService } from '../discount/discount.service';
import { CartItemEntity } from './entities/cartItem.entity';
import { ProductEntity } from '../product/product.entity';
import { DiscountEntity, DiscountType } from '../discount/discount.entity';

@Injectable()
export class CartService {
  constructor(
    private cartRepository: CartRepository,
    private discountService: DiscountService,
  ) {}

  async addProduct(user: UserEntity, productId: number, quantity: number) {
    await this.cartRepository.transaction(async (cartRepo) => {
      const manager = cartRepo.manager;
      const itemRepo = manager.getRepository(CartItemEntity);
      const prodRepo = manager.getRepository(ProductEntity);

      // 1) Lookup or create cart
      let cart = await cartRepo.findOne({ where: { user: { id: user.id } } });
      if (!cart) {
        cart = cartRepo.create({ user, items: [] });
        cart = await cartRepo.save(cart);
      }

      // 2) Fetch product & stock checks
      const product = await prodRepo.findOne({ where: { id: productId } });
      if (!product) throw new NotFoundException('Product not found');
      if (product.stock < quantity)
        throw new BadRequestException('Insufficient stock');

      // 3) Add or update cart‐item
      let item = await itemRepo.findOne({
        where: { cart: { id: cart.id }, product: { id: productId } },
      });
      if (item) {
        if (product.stock < item.quantity + quantity)
          throw new BadRequestException(
            'Insufficient stock for increased quantity',
          );
        item.quantity += quantity;
        await itemRepo.save(item);
      } else {
        item = itemRepo.create({ cart, product, quantity });
        await itemRepo.save(item);
      }
    });
    return await this.viewCart(user);
  }

  async removeProduct(user: UserEntity, productId: number, quantity?: number) {
    await this.cartRepository.transaction(async (cartRepo) => {
      const manager = cartRepo.manager;
      const itemRepo = manager.getRepository(CartItemEntity);

      const cart = await cartRepo.findOne({ where: { user: { id: user.id } } });
      if (!cart) throw new NotFoundException('Cart not found');

      const item = await itemRepo.findOne({
        where: { cart: { id: cart.id }, product: { id: productId } },
      });
      if (!item) throw new NotFoundException('Product not in cart');

      if (!quantity || item.quantity <= quantity) {
        await itemRepo.delete(item.id);
      } else {
        item.quantity -= quantity;
        await itemRepo.save(item);
      }
    });
  }

  async applyDiscount(user: UserEntity, code: string) {
    await this.cartRepository.transaction(async (cartRepo) => {
      const cart = await cartRepo.findOne({ where: { user: { id: user.id } } });
      if (!cart) throw new NotFoundException('Cart not found');

      const discount = await this.discountService.findByCode(code);
      if (!discount || !discount.isActive)
        throw new NotFoundException('Discount not found or inactive');
      if (discount.expiration && discount.expiration < new Date())
        throw new BadRequestException('Discount expired');

      cart.discount = discount;
      await cartRepo.save(cart);
    });
    return await this.viewCart(user);
  }

  async removeDiscount(user: UserEntity) {
    await this.cartRepository.transaction(async (cartRepo) => {
      const cart = await cartRepo.findOne({ where: { user: { id: user.id } } });
      if (!cart) throw new NotFoundException('Cart not found');
      if (!cart.discount) {
        throw new NotFoundException('There is no active discount on this cart');
      }

      cart.discount = null;
      await cartRepo.save(cart);
    });
    return await this.viewCart(user);
  }

  async viewCart(user: UserEntity) {
    const cart = await this.getOrCreateUserCart(user);

    const items: Array<{
      productId: number;
      description?: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }> = [];

    let subtotal = 0;
    for (const item of cart.items) {
      const rowSubtotal = item.product.price * item.quantity;
      items.push({
        productId: item.product.id,
        description: item.product.description,
        unitPrice: item.product.price,
        quantity: item.quantity,
        subtotal: rowSubtotal,
      });
      subtotal += rowSubtotal;
    }

    const discountAmount = this.calculateDiscount(subtotal, cart.discount);
    const total = subtotal - discountAmount;

    return {
      items,
      subtotal,
      discount_amount: discountAmount,
      discount: cart.discount,
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
    discount?: DiscountEntity | null | undefined,
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
