import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsNotEmpty,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647, {
    message: 'productId must be a 32‑bit integer',
  })
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647, {
    message: 'productId must be a 32‑bit integer',
  })
  quantity: number;
}

export class RemoveFromCartDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647, {
    message: 'productId must be a 32‑bit integer',
  })
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647, {
    message: 'productId must be a 32‑bit integer',
  })
  @IsOptional()
  quantity?: number;
}

export class ApplyDiscountDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
