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
import { JwtAuthGuard } from '../auth/libs/guards/jwt.guard';
import { DiscountService } from './discount.service';
import { CreateDiscountDto, UpdateDiscountDto } from './libs/discount.dto';
import { Role } from '../user/libs/enums/roles.enum';
import { Roles } from '../auth/libs/decorator/roles.decorator';
import { RolesGuard } from '../auth/libs/guards/roles.guard';

@Controller('discounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DiscountController {
  constructor(private discountService: DiscountService) {}

  /** Create a new discount */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDiscountDto) {
    return this.discountService.createDiscount(dto);
  }

  /** List all discounts */
  @Get()
  @HttpCode(HttpStatus.OK)
  list() {
    return this.discountService.findAll();
  }

  /** Get one by ID */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  find(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.findById(id);
  }

  /** Update an existing discount */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ) {
    return this.discountService.updateDiscount(id, dto);
  }

  /** Remove a discount */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.removeDiscount(id);
  }
}
