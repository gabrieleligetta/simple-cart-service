import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../libs/database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { DiscountModule } from './discount/discount.module';
import * as Joi from 'joi';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/libs/guards/roles.guard';
import { JwtAuthGuard } from './auth/libs/guards/jwt.guard';

@Module({
  imports: [
    DatabaseModule.register(),
    AuthModule,
    UserModule,
    ProductModule,
    DiscountModule,
    CartModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_DURATION: Joi.string().required(),
        ADMIN_EMAIL: Joi.string().required(),
        ADMIN_PASSWORD: Joi.string().required(),
        DROP_SCHEMA: Joi.boolean().required(),
      }),
      envFilePath: './.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
