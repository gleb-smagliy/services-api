import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateServiceDto,
  GetServiceDto,
  GetServicesListDto,
  UpdateServiceDto,
} from '../dto/service.dto';
import { ServicesRepository } from '../repositories/services.repository';
import { GetServicesQuery } from '../dto/service.dto';
import { Identity } from '../../../modules/identity/identity';

@Injectable()
export class ServicesService {
  constructor(private serviceRepository: ServicesRepository) {}

  async create(
    identity: Identity,
    createServiceDto: CreateServiceDto,
  ): Promise<GetServiceDto> {
    const service = await this.serviceRepository.createOrReplace({
      ...createServiceDto,
      tenantId: identity.tenantId,
    });

    return new GetServiceDto(service);
  }

  async findAll(
    identity: Identity,
    query: GetServicesQuery,
  ): Promise<GetServicesListDto> {
    const result = await this.serviceRepository.find({
      offset: query.offset,
      limit: query.limit,
      tenantId: identity.tenantId,
      search: query.search,
      sort: query.sort,
    });

    return new GetServicesListDto(result.data, result.meta);
  }

  async findOne(identity: Identity, id: string): Promise<GetServiceDto> {
    const service = await this.serviceRepository.findOne({
      id,
      tenantId: identity.tenantId,
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return new GetServiceDto(service);
  }

  async createOrReplace(
    identity: Identity,
    id: string,
    createServiceDto: CreateServiceDto,
  ): Promise<GetServiceDto> {
    const service = await this.serviceRepository.createOrReplace({
      ...createServiceDto,
      id,
      tenantId: identity.tenantId,
    });

    return new GetServiceDto(service);
  }

  async update(
    identity: Identity,
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<GetServiceDto> {
    const service = await this.serviceRepository.update(
      { id, tenantId: identity.tenantId },
      updateServiceDto,
    );

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return new GetServiceDto(service);
  }

  async delete(identity: Identity, id: string) {
    const hasDeleted = await this.serviceRepository.delete({
      id,
      tenantId: identity.tenantId,
    });

    if (!hasDeleted) {
      throw new NotFoundException('Service not found');
    }
  }
}
