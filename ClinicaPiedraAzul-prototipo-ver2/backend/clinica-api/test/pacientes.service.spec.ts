import { Test, TestingModule } from '@nestjs/testing';
import { PacientesService } from '../src/pacientes/pacientes.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreatePacienteDto } from '../src/pacientes/dto/create-paciente.dto';
import { NotFoundException } from '@nestjs/common';

describe('PacientesService', () => {
  let service: PacientesService;
  let prismaService: any; // Usamos any para evitar que TypeScript marque propiedades de PrismaClient (paciente) como no existentes

  beforeEach(async () => {
    const mockPrismaService = {
      paciente: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacientesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PacientesService>(PacientesService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of pacientes', async () => {
      const pacientes = [{ id: 1, documento: '123' }];
      prismaService.paciente.findMany.mockResolvedValue(pacientes);

      const result = await service.findAll();
      expect(result).toEqual(pacientes);
      expect(prismaService.paciente.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a paciente if found', async () => {
      const paciente = { id: 1, documento: '123' };
      prismaService.paciente.findUnique.mockResolvedValue(paciente);

      const result = await service.findOne(1);
      expect(result).toEqual(paciente);
      expect(prismaService.paciente.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if not found', async () => {
      prismaService.paciente.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDocumento', () => {
    it('should return a paciente by documento', async () => {
      const paciente = { id: 1, documento: '123' };
      prismaService.paciente.findUnique.mockResolvedValue(paciente);

      const result = await service.findByDocumento('123');
      expect(result).toEqual(paciente);
      expect(prismaService.paciente.findUnique).toHaveBeenCalledWith({ where: { documento: '123' } });
    });
  });

  describe('create', () => {
    it('should create a new paciente', async () => {
      const dto: CreatePacienteDto = {
        documento: '123',
        nombres: 'Juan',
        apellidos: 'Perez',
        celular: '123456789',
        genero: 'Hombre',
      };
      const paciente = { id: 1, ...dto };
      prismaService.paciente.create.mockResolvedValue(paciente);

      const result = await service.create(dto);
      expect(result).toEqual(paciente);
      expect(prismaService.paciente.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('update', () => {
    it('should update a paciente', async () => {
      const paciente = { id: 1, documento: '123' };
      const updateData = { nombres: 'Juan Updated' };
      const updatedPaciente = { ...paciente, ...updateData };
      prismaService.paciente.findUnique.mockResolvedValue(paciente);
      prismaService.paciente.update.mockResolvedValue(updatedPaciente);

      const result = await service.update(1, updateData);
      expect(result).toEqual(updatedPaciente);
      expect(prismaService.paciente.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prismaService.paciente.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updateData });
    });

    it('should throw NotFoundException if paciente not found', async () => {
      prismaService.paciente.findUnique.mockResolvedValue(null);

      await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a paciente', async () => {
      const paciente = { id: 1, documento: '123' };
      prismaService.paciente.findUnique.mockResolvedValue(paciente);
      prismaService.paciente.delete.mockResolvedValue(paciente);

      const result = await service.remove(1);
      expect(result).toEqual(paciente);
      expect(prismaService.paciente.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prismaService.paciente.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if paciente not found', async () => {
      prismaService.paciente.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});