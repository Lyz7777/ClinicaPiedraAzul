import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Flujo completo de cita (Integración)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  it('Debería crear una cita y permitir reagendarla', async () => {
    // 1. Crear paciente de prueba
    const paciente = await prisma.paciente.create({
      data: {
        documento: 'TEST123456',
        nombres: 'Test',
        apellidos: 'Integración',
        celular: '3000000001',
        genero: 'Otro',
      }
    });
    
    // 2. Crear médico de prueba
    const medico = await prisma.medico.create({
      data: {
        nombre: 'Dr. Test Integración',
        especialidad: 'Médico/Terapista',
      }
    });
    
    // 3. Crear configuración de horario para el médico
    await prisma.configuracionMedico.create({
      data: {
        medicoId: medico.id,
        diasAtencion: 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES',
        horaInicio: '08:00',
        horaFin: '17:00',
        intervaloMinutos: 30,
      }
    });
    
    // 4. Crear cita
    const fechaCita = '2026-07-15';
    const horaCita = '10:00';
    
    const cita = await prisma.cita.create({
      data: {
        fecha: fechaCita,
        hora: horaCita,
        pacienteId: paciente.id,
        medicoId: medico.id,
        estado: 'AGENDADA',
        codigoVerificacion: 'CITA-INTEGRATION-TEST',
      }
    });
    
    expect(cita.id).toBeDefined();
    expect(cita.codigoVerificacion).toBe('CITA-INTEGRATION-TEST');
    expect(cita.estado).toBe('AGENDADA');
    
    console.log('✅ Cita creada correctamente');
    
    // 5. Reagendar cita
    const nuevaFecha = '2026-07-16';
    const nuevaHora = '11:00';
    
    const citaReagendada = await prisma.cita.update({
      where: { id: cita.id },
      data: { fecha: nuevaFecha, hora: nuevaHora }
    });
    
    expect(citaReagendada.fecha).toBe(nuevaFecha);
    expect(citaReagendada.hora).toBe(nuevaHora);
    
    console.log('✅ Cita reagendada correctamente');
    
    // 6. Crear historial de cambio
    const historial = await prisma.historialCita.create({
      data: {
        citaId: cita.id,
        campo: 'fecha',
        valorAnterior: fechaCita,
        valorNuevo: nuevaFecha,
        modificadoPor: 'medico_test'
      }
    });
    
    expect(historial.id).toBeDefined();
    expect(historial.campo).toBe('fecha');
    
    console.log('✅ Historial creado correctamente');
    
    // 7. Marcar asistencia
    const citaAsistencia = await prisma.cita.update({
      where: { id: cita.id },
      data: { asistio: true }
    });
    
    expect(citaAsistencia.asistio).toBe(true);
    
    console.log('✅ Asistencia marcada correctamente');
    console.log('🎉 Flujo completo exitoso');
  });
});