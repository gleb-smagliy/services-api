import { DeepPartial, Repository } from 'typeorm';
import { Version } from '../entities/version.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

interface FindQuery {
  serviceId: string;
  tenantId: string;
  offset: number;
  limit: number;
}

interface FindOneQuery {
  serviceId: string;
  tenantId: string;
  id: string;
}

@Injectable()
export class VersionsRepository {
  constructor(
    @InjectRepository(Version)
    private readonly repository: Repository<Version>,
  ) {}

  async find(query: FindQuery): Promise<{
    data: Version[];
    meta: { total: number };
  }> {
    const { offset, limit } = query;
    const { serviceId, tenantId } = query;

    const result = await this.repository.findAndCount({
      where: {
        service: { id: serviceId },
        tenantId,
      },
      order: {
        updatedAt: 'DESC',
      },
      skip: offset,
      take: limit,
    });

    return {
      data: result[0],
      meta: {
        total: result[1],
      },
    };
  }

  async findOne(query: FindOneQuery): Promise<Version | null> {
    const result = await this.repository.findOne({
      where: {
        id: query.id,
        service: { id: query.serviceId },
        tenantId: query.tenantId,
      },
    });

    return result ?? null;
  }

  async createOrReplace(
    query: Omit<FindOneQuery, 'id'>,
    entityLike: DeepPartial<Version>,
  ): Promise<Version> {
    const version = this.repository.create({
      ...entityLike,
      service: { id: query.serviceId },
    });

    return await this.repository.save(version);
  }

  async update(
    query: FindOneQuery,
    entityLike: Exclude<DeepPartial<Version>, 'service'>,
  ): Promise<Version> {
    await this.repository.update(
      {
        id: query.id,
        service: { id: query.serviceId },
        tenantId: query.tenantId,
      },
      entityLike,
    );

    return this.findOne(query);
  }

  async delete(query: FindOneQuery): Promise<boolean> {
    const result = await this.repository.delete({
      id: query.id,
      service: { id: query.serviceId },
      tenantId: query.tenantId,
    });

    return result.affected > 0;
  }
}
