import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthTokenService } from './auth-token.service';
import { Identity } from './identity';

@Injectable()
export class IdentityInterceptor implements NestInterceptor {
  constructor(private readonly authTokenService: AuthTokenService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await this.authTokenService.validateToken(token);
      request.identity = decodedToken as Identity;

      return next.handle();
    } catch (error) {
      throw new UnauthorizedException('Invalid authorization token');
    }
  }
}
