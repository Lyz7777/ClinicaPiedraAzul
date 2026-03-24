import { NestFactory } from '@nestjs/core';
import { AuthModule } from '../../clinica-api/src/auth/auth.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  await app.listen(3001);

}
bootstrap();
