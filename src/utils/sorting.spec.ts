import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { Sort, Sorting } from './sorting';

class TestSortDto {
  @Sort(['name', 'updated'])
  sort: Sorting<'name' | 'updated'>;
}

describe('Sort Decorator', () => {
  it('should return an empty array when no sort parameter is provided', () => {
    const dto = plainToInstance(TestSortDto, {});
    expect(dto.sort).toEqual([]);
  });

  it('should transform a single sort string into an array of sort orders', () => {
    const dto = plainToInstance(TestSortDto, { sort: 'name desc' });
    expect(dto.sort).toEqual([['name', 'DESC']]);

    const dtoAsc = plainToInstance(TestSortDto, { sort: 'updated asc' });
    expect(dtoAsc.sort).toEqual([['updated', 'ASC']]);
  });

  it('should transform an array of sort strings', () => {
    const dto = plainToInstance(TestSortDto, {
      sort: ['name desc', 'updated asc'],
    });
    expect(dto.sort).toEqual([
      ['name', 'DESC'],
      ['updated', 'ASC'],
    ]);
  });

  it('should throw an error for an unsupported sort key', () => {
    expect(() => {
      plainToInstance(TestSortDto, { sort: 'invalid asc' });
    }).toThrowError('Unsupported sort key: invalid');
  });

  it('should throw a BadRequestException for non-string sort values', () => {
    expect(() => {
      plainToInstance(TestSortDto, { sort: 123 as any });
    }).toThrow(BadRequestException);
  });

  it('should throw an error when sort string lacks a direction', () => {
    expect(() => {
      plainToInstance(TestSortDto, { sort: 'name' });
    }).toThrow();
  });

  it('should throw a BadRequestException if one element in an array is not a string', () => {
    expect(() => {
      plainToInstance(TestSortDto, { sort: ['name desc', 123 as any] });
    }).toThrow(BadRequestException);
  });
});
