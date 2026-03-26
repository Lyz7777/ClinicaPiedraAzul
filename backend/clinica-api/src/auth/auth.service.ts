import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(private jwtService: JwtService) {}

  private usuarios = [
    { id: 1, username: 'admin', password: '1234' }
  ];

  validateUser(username: string, password: string) {
    return this.usuarios.find(
      u => u.username === username && u.password === password
    );
  }

  login(user: any) {
    const payload = { username: user.username, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}