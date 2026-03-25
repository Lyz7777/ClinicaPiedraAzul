import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPacientes, crearPaciente, buscarPacientePorDocumento, actualizarPaciente } from '../src/app/services/pacientes.service';

// Mock fetch globally
;(globalThis as any).fetch = vi.fn();

describe('Pacientes Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPacientes', () => {
    it('should fetch all pacientes', async () => {
      const mockPacientes = [{ id: 1, documento: '123' }];
      (globalThis as any).fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockPacientes),
      });

      const result = await getPacientes();
      expect(result).toEqual(mockPacientes);
      expect((globalThis as any).fetch).toHaveBeenCalledWith('http://localhost:3000/pacientes');
    });
  });

  describe('crearPaciente', () => {
    it('should create a new paciente', async () => {
      const pacienteData = {
        documento: '123',
        nombres: 'Juan',
        apellidos: 'Perez',
        celular: '123456789',
        genero: 'Hombre' as const,
        fechaNacimiento: '1990-01-01',
        email: 'juan@example.com',
      };
      const mockResponse = { id: 1, ...pacienteData };
      (globalThis as any).fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await crearPaciente(pacienteData);
      expect(result).toEqual(mockResponse);
      expect((globalThis as any).fetch).toHaveBeenCalledWith('http://localhost:3000/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pacienteData),
      });
    });
  });

  describe('buscarPacientePorDocumento', () => {
    it('should return paciente if found', async () => {
      const mockPaciente = { id: 1, documento: '123' };
      (globalThis as any).fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPaciente),
      });

      const result = await buscarPacientePorDocumento('123');
      expect(result).toEqual(mockPaciente);
      expect((globalThis as any).fetch).toHaveBeenCalledWith('http://localhost:3000/pacientes/documento/123');
    });

    it('should return null if not found (404)', async () => {
      (globalThis as any).fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await buscarPacientePorDocumento('123');
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (globalThis as any).fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await buscarPacientePorDocumento('123');
      expect(result).toBeNull();
    });
  });

  describe('actualizarPaciente', () => {
    it('should update a paciente', async () => {
      const updateData = { nombres: 'Juan Updated' };
      const mockResponse = { id: 1, documento: '123', nombres: 'Juan Updated' };
      (globalThis as any).fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await actualizarPaciente(1, updateData);
      expect(result).toEqual(mockResponse);
      expect((globalThis as any).fetch).toHaveBeenCalledWith('http://localhost:3000/pacientes/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
    });
  });
});