// @ts-nocheck
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
    medico: { findUnique: jest.fn().mockResolvedValue(null) },
    paciente: { findUnique: jest.fn().mockResolvedValue(null) },
    configuracionMedico: { findUnique: jest.fn().mockResolvedValue(null) },
    configuracionGlobal: { findFirst: jest.fn().mockResolvedValue({ ventanaSemanas: 4 }) },
    historialCita: { create: jest.fn().mockResolvedValue({}), findMany: jest.fn().mockResolvedValue([]) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CitasService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();
    service = module.get<CitasService>(CitasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
