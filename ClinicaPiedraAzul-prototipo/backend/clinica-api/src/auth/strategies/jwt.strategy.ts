import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const audience = configService.get<string>('AUTH0_AUDIENCE');
    const issuer = domain ? `https://${domain}/` : undefined;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer,
      audience,
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: domain ? `https://${domain}/.well-known/jwks.json` : '',
      }),
    });
  }

  async validate(payload: any) {
    const rolesClaim = payload?.['https://piedrazul.com/roles'];
    const roles = Array.isArray(rolesClaim)
      ? rolesClaim.map((role: unknown) => String(role).toLowerCase())
      : [];
    const role = roles.includes('admin')
      ? 'admin'
      : roles.includes('scheduler') || roles.includes('agendador') || roles.includes('sheduler')
      ? 'agendador'
      : roles.includes('patient') || roles.includes('paciente')
      ? 'paciente'
      : payload?.role;
    return {
      id: payload.sub,
      username: payload.username || payload.email || payload.nickname,
      role,
    };
  }
}