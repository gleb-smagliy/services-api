import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';

export const DatabaseModule = TypeOrmModule.forRoot(AppDataSource.options);
