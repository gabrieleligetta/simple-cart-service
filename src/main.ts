import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove any properties not in the DTO
      forbidNonWhitelisted: true, // throw if unknown props are passed
      transform: true, // auto-transform payloads to your DTO classes
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
