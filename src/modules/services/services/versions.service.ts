import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateVersionDto,
  GetVersionDto,
  GetVersionsListDto,
  UpdateVersionDto,
} from '../dto/version.dto';
import { VersionsRepository } from '../repositories/versions.repository';
import { PaginationQuery } from '../../../utils/pagination';
import { Identity } from '../../../modules/identity/identity';
import { ServicesRepository } from '../repositories/services.repository';

interface GetVersionQuery {
  serviceId: string;
  id: string;
}

@Injectable()
export class VersionsService {
  constructor(
    private serviceRepository: ServicesRepository,
    private versionRepository: VersionsRepository,
  ) {}

  async create(
    identity: Identity,
    serviceId: string,
    createVersionDto: CreateVersionDto,
  ): Promise<GetVersionDto> {
    const service = await this.serviceRepository.findOne({
      id: serviceId,
      tenantId: identity.tenantId,
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const result = await this.versionRepository.createOrReplace(
      {
        serviceId: service.id,
        tenantId: identity.tenantId,
      },
      {
        ...createVersionDto,
        tenantId: identity.tenantId,
      },
    );

    return new GetVersionDto(result);
  }

  async findAll(
    identity: Identity,
    serviceId: string,
    pagination: PaginationQuery,
  ): Promise<GetVersionsListDto> {
    const service = await this.serviceRepository.findOne({
      id: serviceId,
      tenantId: identity.tenantId,
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const data = await this.versionRepository.find({
      serviceId: service.id,
      tenantId: identity.tenantId,
      offset: pagination.offset,
      limit: pagination.limit,
    });

    return new GetVersionsListDto(data.data, data.meta);
  }

  async findOne(
    identity: Identity,
    query: GetVersionQuery,
  ): Promise<GetVersionDto> {
    const version = await this.versionRepository.findOne({
      ...query,
      tenantId: identity.tenantId,
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    return new GetVersionDto(version);
  }

  async update(
    identity: Identity,
    query: GetVersionQuery,
    updateVersionDto: UpdateVersionDto,
  ): Promise<GetVersionDto> {
    const version = await this.versionRepository.findOne({
      ...query,
      tenantId: identity.tenantId,
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const result = await this.versionRepository.update(
      {
        ...query,
        tenantId: identity.tenantId,
      },
      {
        ...updateVersionDto,
      },
    );

    if (!result) {
      throw new NotFoundException('Version not found');
    }

    return new GetVersionDto(result);
  }

  async createOrReplace(
    identity: Identity,
    query: GetVersionQuery,
    createVersionDto: CreateVersionDto,
  ) {
    const result = await this.versionRepository.createOrReplace(
      {
        serviceId: query.serviceId,
        tenantId: identity.tenantId,
      },
      {
        ...createVersionDto,
        id: query.id,
        tenantId: identity.tenantId,
      },
    );

    return new GetVersionDto(result);
  }

  async delete(identity: Identity, query: GetVersionQuery) {
    const hasDeleted = await this.versionRepository.delete({
      id: query.id,
      serviceId: query.serviceId,
      tenantId: identity.tenantId,
    });

    if (!hasDeleted) {
      throw new NotFoundException('Version not found');
    }
  }
}
