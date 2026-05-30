import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { MedicosModule } from './medicos/medicos.module';
import { CitasModule } from './citas/citas.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PacientesModule,
    MedicosModule,
    CitasModule,
    ConfiguracionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}