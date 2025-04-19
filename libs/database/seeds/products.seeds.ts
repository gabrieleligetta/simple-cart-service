import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { AppModule } from '../../../src/app.module';
import { ProductEntity } from '../../../src/product/product.entity';

// savage TOTAL value to test indexes performance on product table with 1 mln records
const TOTAL = 1000000;
const BATCH_SIZE = 10000;

async function bootstrap() {
  const appCtx = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const ds = appCtx.get<DataSource>(DataSource);
  const repo = ds.getRepository(ProductEntity);

  console.log(
    `🔄 Starting seed of ${TOTAL} products in batches of ${BATCH_SIZE}…`,
  );

  for (let offset = 0; offset < TOTAL; offset += BATCH_SIZE) {
    const batch: Partial<ProductEntity>[] = [];
    const chunkCount = Math.min(BATCH_SIZE, TOTAL - offset);

    for (let i = 0; i < chunkCount; i++) {
      batch.push({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
        stock: faker.number.int({ min: 0, max: 1000 }),
      });
    }

    await repo.insert(batch);
    console.log(`  ✅ Inserted ${offset + chunkCount} / ${TOTAL}`);
  }

  console.log(`🎉 Completed seeding ${TOTAL} products.`);
  await appCtx.close();
}

bootstrap().catch((err) => {
  console.error('Seeder failed:', err);
  process.exit(1);
});
