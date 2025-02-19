import { Injectable } from '@nestjs/common';
import { Identity } from './identity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async validateToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token);
  }

  async signToken(payload: Identity): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
