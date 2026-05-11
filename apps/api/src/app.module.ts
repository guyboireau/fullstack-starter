import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rend le module global pour éviter d'importer ConfigModule dans chaque module enfant
      envFilePath: '../../.env', // nest start s'exécute depuis apps/api, donc ../../ remonte à la racine du monorepo
    }),
    AuthModule,
    UsersModule,
    ItemsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}