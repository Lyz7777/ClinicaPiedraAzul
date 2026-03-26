import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.paciente.findMany();
  }

  async findOne(id: number) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');
    return paciente;
  }

  async findByDocumento(documento: string) {
    return this.prisma.paciente.findUnique({
      where: { documento },
    });
  }

  async create(data: CreatePacienteDto) {
    return this.prisma.paciente.create({ data });
  }

  async update(id: number, data: Partial<CreatePacienteDto>) {
    await this.findOne(id);
    return this.prisma.paciente.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.paciente.delete({ where: { id } });
  }
}