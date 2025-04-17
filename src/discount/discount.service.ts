import { Injectable } from '@nestjs/common';
import { DiscountRepository } from './discount.repository';
import { DeepPartial } from 'typeorm';
import { DiscountEntity } from './discount.entity';

@Injectable()
export class DiscountService {
  constructor(private discountRepository: DiscountRepository) {}

  createDiscount(data: DeepPartial<DiscountEntity>) {
    return this.discountRepository.create(data);
  }

  findAll() {
    return this.discountRepository.list();
  }

  findByCode(code: string) {
    return this.discountRepository.findBy('code', code);
  }

  findById(id: number) {
    return this.discountRepository.findBy('id', id);
  }

  updateDiscount(id: number, data: DeepPartial<DiscountEntity>) {
    return this.discountRepository.update(id, data);
  }

  removeDiscount(id: number) {
    return this.discountRepository.delete(id);
  }
}
