import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(private prismaService: PrismaService) {}

  async findAll(order: 'asc' | 'desc' = 'asc'): Promise<any[]> {
    try {
      const pacientes = await this.prismaService.paciente.findMany({
        orderBy: { apellidos: order },
      });
      return pacientes || [];
    } catch (error) {
      console.error('Error en findAll pacientes:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<any> {
    const paciente = await this.prismaService.paciente.findUnique({ where: { id } });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');
    return paciente;
  }

  async findByDocumento(documento: string): Promise<any> {
    return this.prismaService.paciente.findUnique({ where: { documento } });
  }

  async findByAuth0Id(auth0Id: string): Promise<any> {
    return this.prismaService.paciente.findUnique({ where: { auth0Id } });
  }

  async create(data: CreatePacienteDto): Promise<any> {
    return this.prismaService.paciente.create({ data });
  }

  async update(id: number, data: Partial<CreatePacienteDto>): Promise<any> {
    await this.findOne(id);
    return this.prismaService.paciente.update({ where: { id }, data });
  }

  async remove(id: number): Promise<any> {
    await this.findOne(id);
    return this.prismaService.paciente.delete({ where: { id } });
  }
}