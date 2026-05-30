import { Test, TestingModule } from '@nestjs/testing';
import { MedicosService } from './medicos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MedicosService', () => {
  let service: MedicosService;

  const mockPrismaService = {
    medico: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    configuracionMedico: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MedicosService>(MedicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar lista de médicos', async () => {
      const mockMedicos = [{ id: 1, nombre: 'Dr. Juan', especialidad: 'Cardiología' }];
      mockPrismaService.medico.findMany.mockResolvedValue(mockMedicos);

      const result = await service.findAll('asc');
      
      expect(result).toEqual(mockMedicos);
    });
  });

  describe('findOne', () => {
    it('debe lanzar error si el médico no existe', async () => {
      mockPrismaService.medico.findUnique.mockResolvedValue(null);
      
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('debe retornar el médico si existe', async () => {
      const mockMedico = { id: 1, nombre: 'Dr. Juan', especialidad: 'Cardiología' };
      mockPrismaService.medico.findUnique.mockResolvedValue(mockMedico);

      const result = await service.findOne(1);
      
      expect(result).toEqual(mockMedico);
    });
  });
});