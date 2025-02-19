import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  Query,
  NotFoundException,
  Param,
  HttpCode,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { VersionsService } from '../services/versions.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQuery } from '../../../utils/pagination';
import {
  CreateVersionDto,
  GetVersionDto,
  GetVersionQuery,
  GetVersionsListDto,
  UpdateVersionDto,
} from '../dto/version.dto';
import { UuidParam } from '../../../utils/uuid';
import { Identity, IdentityContext } from '../../../modules/identity';
import { IdentityInterceptor } from '../../../modules/identity/identity.interceptor';

@ApiTags('Services')
@ApiBearerAuth('jwtAuth')
@Controller('services/:serviceId/versions')
@UseInterceptors(IdentityInterceptor)
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get()
  @ApiOkResponse({ type: GetVersionsListDto })
  @ApiBadRequestResponse()
  async get(
    @UuidParam('serviceId') serviceId: string,
    @Query() paginationQuery: PaginationQuery,
    @IdentityContext() identity: Identity,
  ): Promise<GetVersionsListDto> {
    return this.versionsService.findAll(identity, serviceId, paginationQuery);
  }

  @Get(':id')
  @ApiOkResponse({ type: GetVersionDto })
  @ApiNotFoundResponse()
  async getOne(
    @Param() getVersionQuery: GetVersionQuery,
    @IdentityContext() identity: Identity,
  ): Promise<GetVersionDto> {
    const version = await this.versionsService.findOne(
      identity,
      getVersionQuery,
    );
    if (!version) {
      throw new NotFoundException('Version not found');
    }
    return version;
  }

  @Patch(':id')
  @ApiOkResponse({ type: GetVersionDto })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  update(
    @Param() versionQuery: GetVersionQuery,
    @Body() updateVersionDto: UpdateVersionDto,
    @IdentityContext() identity: Identity,
  ): Promise<GetVersionDto> {
    return this.versionsService.update(
      identity,
      versionQuery,
      updateVersionDto,
    );
  }

  @Post()
  @ApiCreatedResponse({ type: GetVersionDto })
  @ApiBadRequestResponse()
  @ApiConflictResponse({
    description: 'Version with the given name already exists',
  })
  async create(
    @UuidParam('serviceId') serviceId: string,
    @Body() createVersionDto: CreateVersionDto,
    @IdentityContext() identity: Identity,
  ): Promise<Record<string, any>> {
    const dto = await this.versionsService.create(
      identity,
      serviceId,
      createVersionDto,
    );

    return dto;
  }

  @Put(':id')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  upsert(
    @Param() versionQuery: GetVersionQuery,
    @Body() createVersionDto: CreateVersionDto,
    @IdentityContext() identity: Identity,
  ): Promise<GetVersionDto> {
    return this.versionsService.createOrReplace(
      identity,
      {
        serviceId: versionQuery.serviceId,
        id: versionQuery.id,
      },
      createVersionDto,
    );
  }

  @Delete(':id')
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @HttpCode(204)
  async delete(
    @Param() getVersionQuery: GetVersionQuery,
    @IdentityContext() identity: Identity,
  ) {
    await this.versionsService.delete(identity, getVersionQuery);
  }
}
