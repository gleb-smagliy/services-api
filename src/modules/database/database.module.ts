import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';

console.log('=== AppDataSource.options ===', AppDataSource.options);

export const DatabaseModule = TypeOrmModule.forRoot(AppDataSource.options);
