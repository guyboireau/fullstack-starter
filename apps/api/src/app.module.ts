import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';

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
})
export class AppModule {}