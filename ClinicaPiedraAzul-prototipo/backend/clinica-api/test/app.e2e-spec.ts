import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E - Clínica Violeta', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let medicoId: number;
  let pacienteId: number;
  let citaId: number;

  const adminUser = { username: 'administrador', password: '1234' };
  const fechaBase = '2026-09-15';        // Día laborable (martes)
  const horaInicial = '10:00';
  const nuevaHora = '11:30';             // Otra hora dentro del horario del médico
  const fechaReagendar = fechaBase;      // Mismo día, para evitar problemas de días no laborables

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    prismaService = app.get(PrismaService);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send(adminUser);
    adminToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    const prisma = prismaService as any;
    if (citaId) await prisma.cita?.delete({ where: { id: citaId } }).catch(() => {});
    if (pacienteId) await prisma.paciente?.delete({ where: { id: pacienteId } }).catch(() => {});
    if (medicoId) await prisma.medico?.delete({ where: { id: medicoId } }).catch(() => {});
    await app.close();
  });

  describe('Médicos', () => {
    it('crear médico con configuración', async () => {
      const res = await request(app.getHttpServer())
        .post('/medicos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Dr. E2E', especialidad: 'General' })
        .expect(201);
      medicoId = res.body.id;

      await request(app.getHttpServer())
        .put(`/medicos/${medicoId}/configuracion`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          diasAtencion: ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'],
          horaInicio: '08:00',
          horaFin: '17:00',
          intervaloMinutos: 30,
        })
        .expect(200);
    });

    it('listar médicos', async () => {
      const res = await request(app.getHttpServer())
        .get('/medicos')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Pacientes', () => {
    const docUnico = `E2E-${Date.now()}`;
    it('crear paciente', async () => {
      const res = await request(app.getHttpServer())
        .post('/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          documento: docUnico,
          nombres: 'E2E',
          apellidos: 'Paciente',
          celular: '300987654',
          genero: 'Hombre',
          fechaNacimiento: '1990-01-01',
          email: 'e2e@test.com',
        })
        .expect(201);
      pacienteId = res.body.id;
    });

    it('buscar paciente por documento', async () => {
      const res = await request(app.getHttpServer())
        .get(`/pacientes/documento/${docUnico}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.documento).toBe(docUnico);
    });
  });

  describe('Citas', () => {
    it('crear cita', async () => {
      const res = await request(app.getHttpServer())
        .post('/citas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fecha: fechaBase,
          hora: horaInicial,
          pacienteId,
          medicoId,
          descripcion: 'Consulta',
          estado: 'AGENDADA',
        })
        .expect(201);
      citaId = res.body.id;
      expect(citaId).toBeDefined();
    });

    it('listar citas', async () => {
      const res = await request(app.getHttpServer())
        .get('/citas')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const citas = Array.isArray(res.body) ? res.body : res.body.data;
      expect(Array.isArray(citas)).toBe(true);
      expect(citas.length).toBeGreaterThan(0);
    });

    it('obtener horas disponibles', async () => {
      const res = await request(app.getHttpServer())
        .get(`/citas/horas-disponibles?medicoId=${medicoId}&fecha=${fechaBase}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Verifica que la nueva hora que queremos usar esté disponible (opcional)
      // expect(res.body.includes(nuevaHora)).toBe(true);
    });

    it('reagendar cita (mismo día, cambiar hora)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/citas/${citaId}/reagendar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fecha: fechaReagendar, hora: nuevaHora });
      
      if (res.status !== 200) {
        console.error('Error al reagendar:', res.body);
      }
      expect(res.status).toBe(200);
      expect(res.body.hora).toBe(nuevaHora);
      expect(res.body.fecha).toBe(fechaBase); // la fecha no cambia
    });

    it('mostrar historial', async () => {
      const res = await request(app.getHttpServer())
        .get(`/citas/${citaId}/historial`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Debe haber al menos un cambio (la hora)
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const hayCambioHora = res.body.some((h: any) => h.campo === 'hora');
      expect(hayCambioHora).toBe(true);
    });

    it('exportar CSV', async () => {
      const res = await request(app.getHttpServer())
        .get(`/citas/exportar-csv?medicoId=${medicoId}&fecha=${fechaBase}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('ID Cita');
    });
  });
});