import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const IdentityContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.identity) {
      throw new UnauthorizedException('Identity is not set');
    }

    return request.identity;
  },
);
