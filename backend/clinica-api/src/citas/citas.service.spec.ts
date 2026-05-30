import { Test, TestingModule } from '@nestjs/testing';
import { CitasService } from './citas.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CitasService', () => {
  let service: CitasService;

  const mockPrismaService = {
    cita: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    medico: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    paciente: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    configuracionMedico: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    configuracionGlobal: {
      findFirst: jest.fn().mockResolvedValue({ ventanaSemanas: 4 }),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
    historialCita: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar lista de citas paginadas', async () => {
      const mockCitas = [{ id: 1, fecha: '2026-06-01', hora: '10:00' }];
      mockPrismaService.cita.findMany.mockResolvedValue(mockCitas);
      mockPrismaService.cita.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, 'asc');
      
      expect(result.data).toEqual(mockCitas);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('validarCodigo', () => {
    it('debe lanzar error si el código no existe', async () => {
      mockPrismaService.cita.findFirst.mockResolvedValue(null);
      
      await expect(service.validarCodigo('INVALIDO')).rejects.toThrow(BadRequestException);
    });

    it('debe retornar los datos de la cita si el código es válido', async () => {
      const mockCita = {
        id: 1,
        codigoVerificacion: 'CITA-123',
        paciente: { nombres: 'Ana', apellidos: 'García' },
        medico: { nombre: 'Dr. Juan' },
        fecha: '2026-06-01',
        hora: '10:00',
      };
      mockPrismaService.cita.findFirst.mockResolvedValue(mockCita);

      const result = await service.validarCodigo('CITA-123');
      
      expect(result.valido).toBe(true);
      expect(result.cita.paciente).toBe('Ana García');
    });
  });
});