import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicosService {
  constructor(private prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.prisma;
  }

  async findAll(order: 'asc' | 'desc' = 'asc') {
    const medicos = await this.prisma.medico.findMany({
      orderBy: { nombre: order },
      include: { configuracion: true },
    });
    return medicos.map(medico => ({
      ...medico,
      configuracion: medico.configuracion ? {
        ...medico.configuracion,
        diasAtencion: medico.configuracion.diasAtencion.split(','),
      } : null,
    }));
  }

  async findOne(id: number) {
    const medico = await this.prisma.medico.findUnique({
      where: { id },
      include: { configuracion: true },
    });
    if (!medico) throw new NotFoundException('Médico no encontrado');
    return {
      ...medico,
      configuracion: medico.configuracion ? {
        ...medico.configuracion,
        diasAtencion: medico.configuracion.diasAtencion.split(','),
      } : null,
    };
  }

  async create(data: { nombre: string; especialidad: string }) {
    return this.prisma.medico.create({ data });
  }

  async update(id: number, data: { nombre?: string; especialidad?: string }) {
    await this.findOne(id);
    return this.prisma.medico.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.medico.delete({ where: { id } });
  }

  async getConfiguracion(id: number) {
    await this.findOne(id);
    const config = await this.prisma.configuracionMedico.findUnique({ where: { medicoId: id } });
    if (!config) {
      return {
        medicoId: id,
        diasAtencion: ['LUNES', 'MIÉRCOLES', 'VIERNES'],
        horaInicio: '08:00',
        horaFin: '17:00',
        intervaloMinutos: 30,
      };
    }
    return { ...config, diasAtencion: config.diasAtencion.split(',') };
  }

  async saveConfiguracion(id: number, data: any) {
    await this.findOne(id);
    const diasAtencionString = data.diasAtencion.join(',');
    return this.prisma.configuracionMedico.upsert({
      where: { medicoId: id },
      update: {
        diasAtencion: diasAtencionString,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        intervaloMinutos: data.intervaloMinutos,
      },
      create: {
        medicoId: id,
        diasAtencion: diasAtencionString,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        intervaloMinutos: data.intervaloMinutos,
      },
    });
  }
}