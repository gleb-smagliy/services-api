import { Module } from '@nestjs/common';
import { ServicesService } from './services/services.service';
import { ServicesController } from './controllers/services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServicesRepository } from './repositories/services.repository';
import { VersionsController } from './controllers/versions.controller';
import { VersionsRepository } from './repositories/versions.repository';
import { VersionsService } from './services/versions.service';
import { Version } from './entities/version.entity';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [IdentityModule, TypeOrmModule.forFeature([Service, Version])],
  controllers: [ServicesController, VersionsController],
  providers: [
    ServicesService,
    ServicesRepository,
    VersionsService,
    VersionsRepository,
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
