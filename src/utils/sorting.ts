import { IsArray, IsObject } from 'class-validator';

import { applyDecorators, BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, TransformFnParams } from 'class-transformer';

export type Sorting<T extends string> = [T, 'ASC' | 'DESC'][];

export function Sort<T extends readonly string[]>(values: T) {
  function transform({ value }: TransformFnParams): Sorting<T[number]> {
    if (!value) {
      return [];
    }

    if (!Array.isArray(value)) {
      value = [value];
    }

    return value.map((item) => {
      if (typeof item !== 'string') {
        throw new BadRequestException(
          'Sort parameter must be an array of strings',
        );
      }

      const [key, direction] = item.split(' ');

      if (!values.includes(key as T[number])) {
        throw new Error(`Unsupported sort key: ${key}`);
      }

      return [
        key as T[number],
        direction?.toLowerCase() == 'desc' ? 'DESC' : 'ASC',
      ];
    });
  }

  return applyDecorators(
    ApiProperty({
      description:
        'The sort parameter. If you specify multiple directions for the same property, the last one will be used.',
      example: 'name desc, updated asc',
      required: false,
      isArray: true,
      enum: values.map((v) => [v, `${v} asc`, `${v} desc`]).flat(),
    }),
    Transform(transform, { toClassOnly: true }),
    IsArray(),
    Expose({ name: 'sort', toClassOnly: true }),
  );
}
