import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cita.findMany({
      include: {
        paciente: true,
        medico: {
          include: {
            configuracion: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.cita.findUnique({
      where: { id },
      include: {
        paciente: true,
        medico: {
          include: {
            configuracion: true,
          },
        },
      },
    });
  }

  async create(data: {
    fecha: string;
    hora: string;
    pacienteId: number;
    medicoId: number;
    descripcion?: string;
    estado?: string;
  }) {
    return this.prisma.cita.create({
      data,
      include: {
        paciente: true,
        medico: true,
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.cita.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.cita.delete({ where: { id } });
  }

  async getByMedicoAndFecha(medicoId: number, fecha: string) {
    return this.prisma.cita.findMany({
      where: {
        medicoId,
        fecha,
      },
      include: {
        paciente: true,
        medico: true,
      },
    });
  }

  async getHorasDisponibles(medicoId: number, fecha: string) {
    const config = await this.prisma.configuracionMedico.findUnique({
      where: { medicoId },
    });

    const horaInicio = config?.horaInicio || '08:00';
    const horaFin = config?.horaFin || '17:00';
    const intervalo = config?.intervaloMinutos || 30;

    const citas = await this.prisma.cita.findMany({
      where: { medicoId, fecha },
      select: { hora: true },
    });

    const horasOcupadas = citas.map(c => c.hora);
    const horasDisponibles: string[] = [];

    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const [finH, finM] = horaFin.split(':').map(Number);

    let horaActual = inicioH * 60 + inicioM;
    const horaFinTotal = finH * 60 + finM;

    while (horaActual < horaFinTotal) {
      const hora = Math.floor(horaActual / 60);
      const minuto = horaActual % 60;
      const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;

      if (!horasOcupadas.includes(horaStr)) {
        horasDisponibles.push(horaStr);
      }

      horaActual += intervalo;
    }

    return horasDisponibles;
  }
}