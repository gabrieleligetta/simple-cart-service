import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return {
              type: 'postgres' as const,
              host: configService.get<string>('POSTGRES_HOST'),
              port: configService.get<number>('POSTGRES_PORT'),
              username: configService.get<string>('POSTGRES_USER'),
              password: configService.get<string>('POSTGRES_PASSWORD'),
              database: configService.get<string>('POSTGRES_DB'),
              autoLoadEntities: true,
              synchronize: true,
              logging: false,
              dropSchema: configService.get<boolean>('DROP_SCHEMA'),
            };
          },
        }),
      ],
    };
  }
}
