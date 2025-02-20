import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { SearchQuery } from '../../../utils/search';
import { PaginationQuery, Paginated } from '../../../utils/pagination';
import { IsOptional, MaxLength, MinLength } from 'class-validator';
import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { Service } from '../entities/service.entity';
import { Sort, Sorting } from '../../../utils/sorting';

export class GetServicesQuery extends IntersectionType(
  SearchQuery,
  PaginationQuery,
) {
  @Sort(Service.SortKeys)
  sort: Sorting<(typeof Service.SortKeys)[number]>;
}

export class GetServiceDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  versionsCount: number;

  constructor(entity: Service) {
    Object.assign(this, entity);
  }
}

export class GetServicesListDto extends Paginated(GetServiceDto) {}

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the service',
    example: 'Service 1',
  })
  @MaxLength(256)
  @MinLength(1)
  @Expose()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The description of the service',
    example: `Service 1's responsibility is mysterious and important`,
  })
  @MaxLength(1024)
  @MinLength(1)
  @Expose()
  description?: string;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
