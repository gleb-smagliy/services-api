import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Paginated } from '../../../utils/pagination';
import { IsOptional, IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';
import { Version } from '../entities/version.entity';

export class GetVersionQuery {
  @ApiProperty()
  @Expose()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @Expose()
  @IsUUID()
  id: string;
}

export class GetVersionDto {
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

  constructor(version: Version) {
    Object.assign(this, version);
  }
}

export class GetVersionsListDto extends Paginated(GetVersionDto) {}

export class CreateVersionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the version',
    example: 'v1.0.0',
  })
  @Expose()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The description of the version',
    example: 'Initial release',
  })
  @Expose()
  description?: string;
}

export class UpdateVersionDto extends PartialType(CreateVersionDto) {}
