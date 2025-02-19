import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  HttpCode,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ServicesService } from '../services/services.service';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateServiceDto,
  GetServiceDto,
  GetServicesListDto,
  UpdateServiceDto,
} from '../dto/service.dto';
import { UuidParam } from '../../../utils/uuid';
import { GetServicesQuery } from '../dto/service.dto';
import {
  Identity,
  IdentityInterceptor,
  IdentityContext,
} from '../../../modules/identity';

export const DEFAULT_IDENTITY: Identity = {
  id: 'user_1',
  tenantId: 'tenant_1',
  role: 'admin',
};

@ApiTags('Services')
@ApiBearerAuth('jwtAuth')
@Controller('services')
@UseInterceptors(IdentityInterceptor)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOkResponse({ type: GetServicesListDto })
  @ApiBadRequestResponse()
  async get(
    @Query() searchQuery: GetServicesQuery,
    @IdentityContext() identity: Identity,
  ): Promise<GetServicesListDto> {
    return this.servicesService.findAll(identity, searchQuery);
  }

  @Get(':id')
  @ApiOkResponse({ type: GetServiceDto })
  @ApiNotFoundResponse({ type: GetServiceDto })
  async getOne(
    @UuidParam('id') id: string,
    @IdentityContext() identity: Identity,
  ): Promise<GetServiceDto> {
    return await this.servicesService.findOne(identity, id);
  }

  @Post()
  @ApiCreatedResponse({ type: GetServiceDto })
  @ApiBadRequestResponse()
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @IdentityContext() identity: Identity,
  ): Promise<GetServiceDto> {
    const dto = await this.servicesService.create(identity, createServiceDto);
    return dto;
  }

  @Put(':id')
  @ApiOkResponse()
  @ApiBadRequestResponse()
  upsert(
    @UuidParam('id') id: string,
    @Body() createServiceDto: CreateServiceDto,
    @IdentityContext() identity: Identity,
  ): Promise<GetServiceDto> {
    return this.servicesService.createOrReplace(identity, id, createServiceDto);
  }

  @Patch(':id')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  update(
    @UuidParam('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @IdentityContext() identity: Identity,
  ): Promise<GetServiceDto> {
    return this.servicesService.update(identity, id, updateServiceDto);
  }

  @Delete(':id')
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @HttpCode(204)
  async delete(
    @UuidParam('id') id: string,
    @IdentityContext() identity: Identity,
  ) {
    await this.servicesService.delete(identity, id);
  }
}
