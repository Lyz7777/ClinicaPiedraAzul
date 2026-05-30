import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Seguridad
  app.use(helmet());
  
  app.useGlobalPipes(new ValidationPipe());
  
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });
  
  await app.listen(3000);
  console.log('🚀 Backend corriendo en http://localhost:3000');
}
bootstrap();