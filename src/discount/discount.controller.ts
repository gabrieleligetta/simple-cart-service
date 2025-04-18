import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/libs/guards/jwt-guard';
import { DiscountService } from './discount.service';
import { DeepPartial } from 'typeorm';
import { DiscountEntity } from './discount.entity';

@Controller('discounts')
@UseGuards(JwtAuthGuard)
export class DiscountController {
  constructor(private discountService: DiscountService) {}

  @Post()
  create(@Body() body: DeepPartial<DiscountEntity>) {
    return this.discountService.createDiscount(body);
  }

  @Get()
  list() {
    return this.discountService.findAll();
  }

  @Get(':id')
  find(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: DeepPartial<DiscountEntity>,
  ) {
    return this.discountService.updateDiscount(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.removeDiscount(id);
  }
}
