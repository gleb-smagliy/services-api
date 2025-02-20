import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity({ name: 'versions' })
@Index(['service'])
export class Version {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 64 })
  @Index()
  tenantId: string;

  @Column({ length: 256 })
  name: string;

  @Column({ length: 1024, nullable: true })
  description: string;

  @ManyToOne(() => Service, (service) => service.versions, {
    eager: true,
    onDelete: 'CASCADE',
    persistence: false,
    nullable: false,
  })
  @JoinColumn({
    name: 'service_id',
    foreignKeyConstraintName: 'fk_service_id',
    referencedColumnName: 'id',
  })
  service: Readonly<Service>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
