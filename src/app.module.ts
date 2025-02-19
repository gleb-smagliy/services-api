import { Module } from '@nestjs/common';
import { ServicesModule } from './modules/services/services.module';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from './modules/identity/identity.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    IdentityModule,
    ServicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
