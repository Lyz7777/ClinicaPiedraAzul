import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracionService } from './configuracion.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  configuracionGlobal: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('ConfiguracionService', () => {
  let service: ConfiguracionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfiguracionService,
        { provide: PrismaService, useValue: { prisma: mockPrisma } },
      ],
    }).compile();

    service = module.get<ConfiguracionService>(ConfiguracionService);
    jest.clearAllMocks();
  });

  describe('getConfiguracionGlobal()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('retorna configuración global existente', async () => {
      mockPrisma.configuracionGlobal.findFirst.mockResolvedValue({ id: 1, ventanaSemanas: 4 });

      const config = await service.getConfiguracionGlobal();

      expect(config.ventanaSemanas).toBe(4);
      expect(mockPrisma.configuracionGlobal.create).not.toHaveBeenCalled();
    });

    it('crea configuración por defecto si no existe ninguna', async () => {
      mockPrisma.configuracionGlobal.findFirst.mockResolvedValue(null);
      mockPrisma.configuracionGlobal.create.mockResolvedValue({ id: 1, ventanaSemanas: 4 });

      await service.getConfiguracionGlobal();

      expect(mockPrisma.configuracionGlobal.create).toHaveBeenCalledWith({
        data: { ventanaSemanas: 4 },
      });
    });
  });

  describe('updateConfiguracionGlobal()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('actualiza ventanaSemanas correctamente', async () => {
      mockPrisma.configuracionGlobal.findFirst.mockResolvedValue({ id: 1, ventanaSemanas: 4 });
      mockPrisma.configuracionGlobal.update.mockResolvedValue({ id: 1, ventanaSemanas: 8 });

      const result = await service.updateConfiguracionGlobal(8);

      expect(mockPrisma.configuracionGlobal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ventanaSemanas: 8 },
      });
      expect(result.ventanaSemanas).toBe(8);
    });

    it('crea configuración si no existe', async () => {
      mockPrisma.configuracionGlobal.findFirst.mockResolvedValue(null);
      mockPrisma.configuracionGlobal.create.mockResolvedValue({ id: 1, ventanaSemanas: 6 });

      const result = await service.updateConfiguracionGlobal(6);

      expect(mockPrisma.configuracionGlobal.create).toHaveBeenCalledWith({
        data: { ventanaSemanas: 6 },
      });
      expect(result.ventanaSemanas).toBe(6);
    });
  });
});
