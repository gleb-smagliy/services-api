import {
  DataSource,
  DeepPartial,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Service } from '../entities/service.entity';
import { Injectable } from '@nestjs/common';
import { Sorting } from '../../../utils/sorting';
import { InjectRepository } from '@nestjs/typeorm';

type SortOptions = Sorting<(typeof Service.SortKeys)[number]> | undefined;

interface FindQuery {
  search?: string;
  offset: number;
  limit: number;
  tenantId: string;
  sort: SortOptions;
}

interface FindOneQuery {
  id: string;
  tenantId: string;
}

@Injectable()
export class ServicesRepository {
  constructor(
    @InjectRepository(Service)
    private readonly repository: Repository<Service>,
  ) {}

  private addSorting(
    queryBuilder: SelectQueryBuilder<Service>,
    sort: SortOptions,
  ): SelectQueryBuilder<Service> {
    if (!sort) {
      return queryBuilder.orderBy('service.updatedAt', 'DESC');
    }

    sort.forEach(([key, order]) => {
      if (Service.SortKeys.includes(key)) {
        queryBuilder.addOrderBy(`service.${key}`, order, 'NULLS LAST');
      }
    });

    return queryBuilder;
  }

  async find(options: FindQuery): Promise<{
    data: Service[];
    meta: { total: number };
  }> {
    const { offset, limit, search, tenantId } = options;

    const query = this.repository.createQueryBuilder('service');

    query.where('service.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere(
        `service.name ILIKE :search
        OR 
        service.description ILIKE :search`,
        { search: `%${search}%` },
      );
    }

    const paginationQuery = this.addSorting(query, options.sort)
      .loadRelationCountAndMap('service.versionsCount', 'service.versions')
      .offset(offset)
      .limit(limit);

    const [data, total] = await Promise.all([
      paginationQuery.getMany(),
      query.getCount(),
    ]);

    return {
      data,
      meta: {
        total,
      },
    };
  }

  async findOne(query: {
    id: string;
    tenantId: string;
  }): Promise<Required<Service> | null> {
    const service = await this.repository.findOne({
      where: {
        id: query.id,
        tenantId: query.tenantId,
      },
      relations: {
        versions: true,
      },
    });

    if (!service) {
      return null;
    }
    service.versionsCount = service.versions?.length ?? 0;

    return service;
  }

  async createOrReplace(entityLike: DeepPartial<Service>): Promise<Service> {
    const service = this.repository.create(entityLike);

    return this.repository.save(service);
  }

  async update(
    query: FindOneQuery,
    service: DeepPartial<Service>,
  ): Promise<Service> {
    await this.repository.update(query, service);

    return this.findOne(query);
  }

  async delete(query: FindOneQuery): Promise<boolean> {
    const result = await this.repository.delete(query);

    return result.affected > 0;
  }
}
