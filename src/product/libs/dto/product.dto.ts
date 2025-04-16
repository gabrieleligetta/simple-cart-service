// src/product/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
