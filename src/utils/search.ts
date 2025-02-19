import { IsString, IsOptional } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class SearchQuery {
  @ApiProperty({
    description: 'The search query',
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Expose()
  search: string;
}
