import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module';
import {
  DiscountEntity,
  DiscountType,
} from '../../../src/discount/discount.entity';

async function bootstrap() {
  // 1) spin up a minimal Nest context
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // 2) grab the TypeORM DataSource
    const ds = app.get<DataSource>(DataSource);
    const repo = ds.getRepository(DiscountEntity);

    // 3) define your six discounts
    const seeds: Partial<DiscountEntity>[] = [
      // Percentage discounts
      {
        code: 'PCT10',
        type: DiscountType.PERCENTAGE,
        amount: 10,
        isActive: true,
      },
      {
        code: 'PCT20',
        type: DiscountType.PERCENTAGE,
        amount: 20,
        isActive: true,
      },
      {
        code: 'PCT30',
        type: DiscountType.PERCENTAGE,
        amount: 30,
        isActive: true,
      },
      // Fixed‑amount discounts
      { code: 'FIX5', type: DiscountType.FIXED, amount: 5, isActive: true },
      { code: 'FIX10', type: DiscountType.FIXED, amount: 10, isActive: true },
      { code: 'FIX25', type: DiscountType.FIXED, amount: 25, isActive: true },
    ];

    // 4) upsert each so you can re‑run safely
    for (const d of seeds) {
      await repo.upsert(d, ['code']);
    }

    console.log(`✅ Seeded ${seeds.length} discounts into the database.`);
  } catch (err) {
    console.error('❌ Failed seeding discounts:', err);
  } finally {
    // 5) tear down
    await app.close();
  }
}

bootstrap();
