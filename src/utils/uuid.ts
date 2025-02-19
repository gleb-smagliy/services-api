import { Param, ParseUUIDPipe } from '@nestjs/common';

export const UuidParam = (paramName: string) => Param(paramName, ParseUUIDPipe);
