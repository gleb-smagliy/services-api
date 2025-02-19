import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  migrationsRun: process.env.NODE_ENV !== 'production',
  entities: [path.resolve(__dirname, '../**/*.entity.{js,ts}')],
  migrations: [path.resolve(__dirname, '../../migrations/*.{js,ts}')],
});
