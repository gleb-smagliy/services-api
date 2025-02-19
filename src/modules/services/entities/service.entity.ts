import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Version } from './version.entity';

@Entity({ name: 'services' })
export class Service {
  static SortKeys = ['updatedAt', 'createdAt', 'name'] as const;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column()
  @Index()
  name: string;

  @Column()
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Index()
  updatedAt: Date;

  @OneToMany(() => Version, (version) => version.service, {
    onDelete: 'CASCADE',
    persistence: false,
  })
  versions: Version[] | undefined;

  versionsCount: number;
}
