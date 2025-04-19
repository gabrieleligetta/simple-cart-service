import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { DiscountType } from '../discount.entity';

export class CreateDiscountDto {
  @IsString()
  @MaxLength(32)
  code: string;

  @IsEnum(DiscountType)
  type: DiscountType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsDateString()
  expiration?: string;
}

// Reuse CreateDiscountDto but make every field optional for updates:
export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {}
