// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { MedicosService } from './medicos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MedicosService', () => {
  let service: MedicosService;

  const mockPrismaService = {
    medico: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    configuracionMedico: { findUnique: jest.fn().mockResolvedValue(null), upsert: jest.fn().mockResolvedValue({}) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicosService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();
    service = module.get<MedicosService>(MedicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});