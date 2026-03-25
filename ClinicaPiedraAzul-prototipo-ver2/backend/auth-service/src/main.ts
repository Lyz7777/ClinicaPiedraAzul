import { NestFactory } from '@nestjs/core';
import { AuthModule } from '../../clinica-api/src/auth/auth.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(3001);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
