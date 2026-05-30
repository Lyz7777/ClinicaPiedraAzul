import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const audience = configService.get<string>('AUTH0_AUDIENCE');

    if (!domain || !audience) {
      throw new Error('Faltan variables de entorno: AUTH0_DOMAIN y AUTH0_AUDIENCE');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience,
      issuer: `https://${domain}/`,
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Token inválido');
    }

    this.logger.log('Payload recibido de Auth0');
    const user = await this.authService.findOrCreateUserFromAuth0(payload);
    
    return {
      id: user.id,
      auth0Id: user.auth0Id,
      email: user.email,
      username: user.username,
      nombre: user.nombre,
      role: user.role,
    };
  }
}