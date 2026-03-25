import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(username: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { username },
    });

    if (!usuario) {
      return null;
    }

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return null;
    }

    return {
      id: usuario.id,
      username: usuario.username,
      role: usuario.role,
    };
  }

  login(user: any) {
    const payload = { username: user.username, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}