import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RolesGuard } from '../src/auth/guards/roles.guard';

describe('E2E - Reagendar citas', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let medicoId: number;
  let pacienteId: number;
  let citaId: number;

  const fechaBase = '2026-09-15';
  const horaInicial = '10:00';
  const nuevaHora = '10:30';
  const nuevaFecha = '2026-09-16';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { username: 'e2e', role: 'admin', id: 'auth0|e2e' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get(PrismaService);

    const medico = await prismaService.prisma.medico.create({
      data: { nombre: 'Dr. Test', especialidad: 'General' },
    });
    medicoId = medico.id;

    const paciente = await prismaService.prisma.paciente.create({
      data: {
        documento: `E2E-${Date.now()}`,
        nombres: 'Paciente',
        apellidos: 'Prueba',
        celular: '300123456',
        genero: 'Hombre',
        fechaNacimiento: '1990-01-01',
        email: 'e2e@test.com',
      },
    });
    pacienteId = paciente.id;

    const cita = await prismaService.prisma.cita.create({
      data: {
        fecha: fechaBase,
        hora: horaInicial,
        pacienteId,
        medicoId,
        descripcion: 'Consulta',
        estado: 'AGENDADA',
      },
    });
    citaId = cita.id;
  });

  afterAll(async () => {
    const prisma = prismaService.prisma as any;
    if (citaId) await prisma.cita?.delete({ where: { id: citaId } }).catch(() => {});
    if (pacienteId) await prisma.paciente?.delete({ where: { id: pacienteId } }).catch(() => {});
    if (medicoId) await prisma.medico?.delete({ where: { id: medicoId } }).catch(() => {});
    await app.close();
  });

  it('PUT /citas/:id/reagendar actualiza fecha y hora', async () => {
    const res = await request(app.getHttpServer())
      .put(`/citas/${citaId}/reagendar`)
      .send({ fecha: nuevaFecha, hora: nuevaHora })
      .expect(200);

    expect(res.body.fecha).toBe(nuevaFecha);
    expect(res.body.hora).toBe(nuevaHora);
  });

  it('GET /citas/:id/historial devuelve cambios', async () => {
    const res = await request(app.getHttpServer())
      .get(`/citas/${citaId}/historial`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const hayCambio = res.body.some((h: any) => h.campo === 'fecha' || h.campo === 'hora');
    expect(hayCambio).toBe(true);
  });
});
