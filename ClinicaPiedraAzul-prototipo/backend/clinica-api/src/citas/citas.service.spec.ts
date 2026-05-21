import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CitasService } from './citas.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  cita: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  medico: {
    findUnique: jest.fn(),
  },
  paciente: {
    findFirst: jest.fn(),
  },
  historialCita: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  configuracionMedico: {
    findUnique: jest.fn(),
  },
};

describe('CitasService', () => {
  let service: CitasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        {
          provide: PrismaService,
          useValue: { prisma: mockPrisma },
        },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
    jest.clearAllMocks();
  });

  // =========================================================
  // GRUPO 1: create()
  // =========================================================
  describe('create()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('lanza BadRequestException si la fecha es hoy o pasada', async () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const fechaAyer = ayer.toISOString().split('T')[0];

      await expect(
        service.create({
          fecha: fechaAyer,
          hora: '10:00',
          pacienteId: 1,
          medicoId: 1,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza NotFoundException si el médico no existe', async () => {
      const fechaFutura = '2026-09-15';
      mockPrisma.medico.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          fecha: fechaFutura,
          hora: '10:00',
          pacienteId: 1,
          medicoId: 999,
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el médico no atiende ese día', async () => {
      mockPrisma.medico.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Dr. Test',
        configuracion: {
          diasAtencion: 'LUNES,MARTES,MIERCOLES',
          horaInicio: '08:00',
          horaFin: '17:00',
          intervaloMinutos: 30,
        },
      });

      await expect(
        service.create({
          fecha: '2026-09-20',
          hora: '10:00',
          pacienteId: 1,
          medicoId: 1,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si la hora está fuera del horario del médico', async () => {
      mockPrisma.medico.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Dr. Test',
        configuracion: {
          diasAtencion: 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES',
          horaInicio: '08:00',
          horaFin: '17:00',
          intervaloMinutos: 30,
        },
      });

      await expect(
        service.create({
          fecha: '2026-09-15',
          hora: '20:00',
          pacienteId: 1,
          medicoId: 1,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si ya existe una cita en esa franja', async () => {
      mockPrisma.medico.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Dr. Test',
        configuracion: {
          diasAtencion: 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES',
          horaInicio: '08:00',
          horaFin: '17:00',
          intervaloMinutos: 30,
        },
      });
      mockPrisma.cita.findFirst.mockResolvedValue({ id: 99 });

      await expect(
        service.create({
          fecha: '2026-09-15',
          hora: '10:00',
          pacienteId: 1,
          medicoId: 1,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('crea la cita exitosamente con datos válidos', async () => {
      mockPrisma.medico.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Dr. Test',
        configuracion: {
          diasAtencion: 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES',
          horaInicio: '08:00',
          horaFin: '17:00',
          intervaloMinutos: 30,
        },
      });
      mockPrisma.cita.findFirst.mockResolvedValue(null);
      mockPrisma.cita.create.mockResolvedValue({
        id: 1,
        fecha: '2026-09-15',
        hora: '10:00',
        pacienteId: 1,
        medicoId: 1,
        estado: 'AGENDADA',
      });

      const result = await service.create({
        fecha: '2026-09-15',
        hora: '10:00',
        pacienteId: 1,
        medicoId: 1,
      });

      expect(result).toHaveProperty('id');
      expect(mockPrisma.cita.create).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================
  // GRUPO 2: reagendarCita()
  // =========================================================
  describe('reagendarCita()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const citaExistente = {
      id: 1,
      fecha: '2026-09-10',
      hora: '09:00',
      medicoId: 1,
      pacienteId: 1,
      estado: 'AGENDADA',
      paciente: { nombres: 'Juan', apellidos: 'Perez' },
      medico: {
        id: 1,
        configuracion: {
          diasAtencion: 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES',
          horaInicio: '08:00',
          horaFin: '17:00',
          intervaloMinutos: 30,
        },
      },
    };

    it('lanza NotFoundException si la cita no existe', async () => {
      mockPrisma.cita.findUnique.mockResolvedValue(null);

      await expect(
        service.reagendarCita(999, '2026-09-15', '10:00', 'admin')
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ForbiddenException si un médico intenta reagendar cita de otro médico', async () => {
      mockPrisma.cita.findUnique.mockResolvedValue({ ...citaExistente });
      mockPrisma.medico.findUnique.mockResolvedValue({ id: 2, auth0Id: 'auth0|otroMedico' });

      await expect(
        service.reagendarCita(1, '2026-09-15', '10:00', 'dr.otro', 'medico', 'auth0|otroMedico')
      ).rejects.toThrow(ForbiddenException);
    });

    it('guarda historial cuando cambia la fecha', async () => {
      mockPrisma.cita.findUnique.mockResolvedValue({ ...citaExistente });
      mockPrisma.medico.findUnique.mockResolvedValue({
        id: 1,
        configuracion: citaExistente.medico.configuracion,
      });
      mockPrisma.cita.findFirst.mockResolvedValue(null);
      mockPrisma.historialCita.create.mockResolvedValue({});
      mockPrisma.cita.update.mockResolvedValue({
        ...citaExistente,
        fecha: '2026-09-15',
        hora: '10:00',
      });

      await service.reagendarCita(1, '2026-09-15', '10:00', 'admin');

      expect(mockPrisma.historialCita.create).toHaveBeenCalled();
      const llamada = mockPrisma.historialCita.create.mock.calls[0][0];
      expect(llamada.data.campo).toBe('fecha');
      expect(llamada.data.valorAnterior).toBe('2026-09-10');
      expect(llamada.data.valorNuevo).toBe('2026-09-15');
      expect(llamada.data.modificadoPor).toBe('admin');
    });

    it('NO guarda historial si la fecha y hora son iguales', async () => {
      mockPrisma.cita.findUnique.mockResolvedValue({ ...citaExistente });
      mockPrisma.medico.findUnique.mockResolvedValue({
        id: 1,
        configuracion: citaExistente.medico.configuracion,
      });
      mockPrisma.cita.findFirst.mockResolvedValue(null);
      mockPrisma.cita.update.mockResolvedValue({ ...citaExistente });

      await service.reagendarCita(1, '2026-09-10', '09:00', 'admin');

      expect(mockPrisma.historialCita.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // GRUPO 3: getHorasDisponibles()
  // =========================================================
  describe('getHorasDisponibles()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('retorna array vacío si el médico no atiende ese día', async () => {
      mockPrisma.configuracionMedico.findUnique.mockResolvedValue({
        diasAtencion: 'LUNES,MIERCOLES,VIERNES',
        horaInicio: '08:00',
        horaFin: '17:00',
        intervaloMinutos: 30,
      });

      const horas = await service.getHorasDisponibles(1, '2026-09-20');
      expect(horas).toEqual([]);
    });

    it('retorna horas libres excluyendo las ocupadas', async () => {
      mockPrisma.configuracionMedico.findUnique.mockResolvedValue({
        diasAtencion: 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES',
        horaInicio: '08:00',
        horaFin: '09:00',
        intervaloMinutos: 30,
      });
      mockPrisma.cita.findMany.mockResolvedValue([{ hora: '08:00' }]);

      const horas = await service.getHorasDisponibles(1, '2026-09-15');
      expect(horas).toEqual(['08:30']);
      expect(horas).not.toContain('08:00');
    });
  });

  // =========================================================
  // GRUPO 4: exportarCitasACSV()
  // =========================================================
  describe('exportarCitasACSV()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('lanza BadRequestException si no hay citas para el filtro', async () => {
      mockPrisma.cita.findMany.mockResolvedValue([]);

      await expect(service.exportarCitasACSV(1, '2026-09-15')).rejects.toThrow(BadRequestException);
    });

    it('retorna CSV con BOM y columnas correctas cuando hay citas', async () => {
      mockPrisma.cita.findMany.mockResolvedValue([
        {
          id: 1,
          fecha: '2026-09-15',
          hora: '10:00',
          estado: 'AGENDADA',
          descripcion: 'Control',
          paciente: { nombres: 'Ana', apellidos: 'Garcia', documento: '123456', celular: '300000000' },
          medico: { nombre: 'Dr. Lopez', especialidad: 'Cardiologia' },
        },
      ]);

      const csv = await service.exportarCitasACSV(1, '2026-09-15');

      expect(csv).toMatch(/^\uFEFF/);
      expect(csv).toContain('ID Cita');
      expect(csv).toContain('Paciente');
      expect(csv).toContain('Ana Garcia');
      expect(csv).toContain('Dr. Lopez');
    });
  });

  // =========================================================
  // GRUPO 5: findAll() con filtros
  // =========================================================
  describe('findAll()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('filtra por medicoId cuando se proporciona', async () => {
      mockPrisma.cita.findMany.mockResolvedValue([]);
      mockPrisma.cita.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'asc', 5, undefined);

      expect(mockPrisma.cita.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ medicoId: 5 }),
        })
      );
    });

    it('filtra por fecha cuando se proporciona', async () => {
      mockPrisma.cita.findMany.mockResolvedValue([]);
      mockPrisma.cita.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'asc', undefined, '2026-09-15');

      expect(mockPrisma.cita.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ fecha: '2026-09-15' }),
        })
      );
    });

    it('retorna estructura correcta con data, total, page, totalPages', async () => {
      mockPrisma.cita.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockPrisma.cita.count.mockResolvedValue(25);

      const result = await service.findAll(2, 10, 'asc');

      expect(result).toMatchObject({
        data: expect.any(Array),
        total: 25,
        page: 2,
        totalPages: 3,
        limit: 10,
      });
    });
  });
});
