import { IsNumber, Min } from 'class-validator';

import { IsInt, IsOptional } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class PaginationMetadata {
  @ApiProperty()
  @Expose()
  total: number;
}

export function Paginated<T extends new (...args: any[]) => any>(dtoType: T) {
  class PaginatedDto {
    @ApiProperty({ type: PaginationMetadata })
    @Expose()
    @Type(() => PaginationMetadata)
    readonly meta: PaginationMetadata;

    @ApiProperty({ type: [dtoType] })
    @Expose()
    @Type(() => dtoType)
    readonly data: InstanceType<T>[];

    constructor(data: ConstructorParameters<T>[0][], meta: PaginationMetadata) {
      this.data = data.map((item) => new dtoType(item));
      this.meta = meta;
    }
  }

  return PaginatedDto;
}

export class PaginationQuery {
  @ApiProperty({
    description: 'The number of items to skip',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @IsInt()
  @IsNotEmpty()
  @Expose()
  offset: number = 0;

  @ApiProperty({
    description: 'The number of items to return per page',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @IsInt()
  @IsNotEmpty()
  @Expose()
  limit: number = 10;
}
