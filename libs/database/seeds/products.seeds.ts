// src/seeds/products.seed.ts
import { NestFactory } from '@nestjs/core'; // il tuo root module
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { AppModule } from '../../../src/app.module';
import { ProductEntity } from '../../../src/product/product.entity';

async function bootstrap() {
  // 1) start an application context NestJS without HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);

  // 2) get the ds
  const ds = app.get<DataSource>(DataSource);

  // 3) get the products repo
  const repo = ds.getRepository(ProductEntity);

  // 4) create 100 products
  const products: ProductEntity[] = [];
  for (let i = 0; i < 100; i++) {
    const p = repo.create({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
      stock: faker.number.int({ min: 0, max: 1000 }),
    });
    products.push(p);
  }

  // 5) batch save
  await repo.save(products);
  console.log(`✅  Ho inserito ${products.length} prodotti di test.`);

  // 6) close context and release the connection
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Errore nel seeding:', err);
  process.exit(1);
});
