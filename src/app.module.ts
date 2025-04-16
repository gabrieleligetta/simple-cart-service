import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../libs/database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    DatabaseModule.register(),
    AuthModule,
    UserModule,
    ProductModule,
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
        DROP_SCHEMA: Joi.boolean().required(),
      }),
      envFilePath: './.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
