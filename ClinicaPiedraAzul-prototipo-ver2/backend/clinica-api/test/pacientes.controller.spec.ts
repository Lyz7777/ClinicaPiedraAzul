import { Test, TestingModule } from '@nestjs/testing';
import { PacientesController } from '../src/pacientes/pacientes.controller';
import { PacientesService } from '../src/pacientes/pacientes.service';
import { CreatePacienteDto } from '../src/pacientes/dto/create-paciente.dto';

describe('PacientesController', () => {
  let controller: PacientesController;
  let service: jest.Mocked<PacientesService>;

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByDocumento: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacientesController],
      providers: [
        {
          provide: PacientesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PacientesController>(PacientesController);
    service = module.get(PacientesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPacientes', () => {
    it('should return all pacientes', async () => {
      const pacientes = [{ id: 1 }];
      service.findAll.mockResolvedValue(pacientes);

      const result = await controller.getPacientes();
      expect(result).toEqual(pacientes);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getPacienteByDocumento', () => {
    it('should return paciente by documento', async () => {
      const paciente = { id: 1, documento: '123' };
      service.findByDocumento.mockResolvedValue(paciente);

      const result = await controller.getPacienteByDocumento('123');
      expect(result).toEqual(paciente);
      expect(service.findByDocumento).toHaveBeenCalledWith('123');
    });
  });

  describe('getPaciente', () => {
    it('should return a paciente by id', async () => {
      const paciente = { id: 1 };
      service.findOne.mockResolvedValue(paciente);

      const result = await controller.getPaciente('1');
      expect(result).toEqual(paciente);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('createPaciente', () => {
    it('should create a new paciente', async () => {
      const dto: CreatePacienteDto = {
        documento: '123',
        nombres: 'Juan',
        apellidos: 'Perez',
        celular: '123456789',
        genero: 'Hombre',
      };
      const paciente = { id: 1, ...dto };
      service.create.mockResolvedValue(paciente);

      const result = await controller.createPaciente(dto);
      expect(result).toEqual(paciente);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('updatePaciente', () => {
    it('should update a paciente', async () => {
      const dto: CreatePacienteDto = {
        documento: '123',
        nombres: 'Juan',
        apellidos: 'Perez',
        celular: '123456789',
        genero: 'Hombre',
      };
      const paciente = { id: 1, ...dto };
      service.update.mockResolvedValue(paciente);

      const result = await controller.updatePaciente('1', dto);
      expect(result).toEqual(paciente);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('deletePaciente', () => {
    it('should delete a paciente', async () => {
      const paciente = { id: 1 };
      service.remove.mockResolvedValue(paciente);

      const result = await controller.deletePaciente('1');
      expect(result).toEqual(paciente);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});