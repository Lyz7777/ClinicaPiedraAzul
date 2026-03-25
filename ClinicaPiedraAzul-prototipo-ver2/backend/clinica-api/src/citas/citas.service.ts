import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  private normalizarTexto(texto: string) {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }

  private obtenerFechaLocal(fecha: string) {
    const [anio, mes, dia] = fecha.split('-').map(Number);

    if (!anio || !mes || !dia) {
      throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
    }

    return new Date(anio, mes - 1, dia);
  }

  private obtenerDiaSemana(fecha: string) {
    const fechaLocal = this.obtenerFechaLocal(fecha);
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[fechaLocal.getDay()];
  }

  private convertirHoraAMinutos(hora: string) {
    const [h, m] = hora.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      throw new BadRequestException('La hora debe tener formato HH:mm');
    }
    return h * 60 + m;
  }

  private validarFechaPosteriorAHoy(fecha: string) {
    const fechaCita = this.obtenerFechaLocal(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaCita <= hoy) {
      throw new BadRequestException(
        'La fecha de la cita debe ser posterior a la fecha actual',
      );
    }
  }

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
    this.validarFechaPosteriorAHoy(data.fecha);

    const medico = await this.prisma.medico.findUnique({
      where: { id: data.medicoId },
      include: { configuracion: true },
    });

    if (!medico) {
      throw new NotFoundException('Médico no encontrado');
    }

    const diasAtencion = medico.configuracion?.diasAtencion ?? 'LUNES,MIERCOLES,VIERNES';
    const horaInicio = medico.configuracion?.horaInicio ?? '08:00';
    const horaFin = medico.configuracion?.horaFin ?? '17:00';
    const intervalo = medico.configuracion?.intervaloMinutos ?? 30;

    const diaCita = this.normalizarTexto(this.obtenerDiaSemana(data.fecha));
    const diasPermitidos = diasAtencion
      .split(',')
      .map((dia) => this.normalizarTexto(dia))
      .filter(Boolean);

    if (!diasPermitidos.includes(diaCita)) {
      throw new BadRequestException(
        `El médico no atiende el día ${diaCita}. Días habilitados: ${diasPermitidos.join(', ')}`,
      );
    }

    const minutosCita = this.convertirHoraAMinutos(data.hora);
    const minutosInicio = this.convertirHoraAMinutos(horaInicio);
    const minutosFin = this.convertirHoraAMinutos(horaFin);

    if (minutosCita < minutosInicio || minutosCita >= minutosFin) {
      throw new BadRequestException(
        `La hora debe estar dentro del horario del médico (${horaInicio} - ${horaFin})`,
      );
    }

    if ((minutosCita - minutosInicio) % intervalo !== 0) {
      throw new BadRequestException(
        `La hora seleccionada no coincide con el intervalo de atención (${intervalo} minutos)`,
      );
    }

    const citaExistente = await this.prisma.cita.findFirst({
      where: {
        medicoId: data.medicoId,
        fecha: data.fecha,
        hora: data.hora,
      },
    });

    if (citaExistente) {
      throw new BadRequestException('Ya existe una cita agendada para ese médico en esa fecha y hora');
    }

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
    this.validarFechaPosteriorAHoy(fecha);

    const config = await this.prisma.configuracionMedico.findUnique({
      where: { medicoId },
    });

    const horaInicio = config?.horaInicio || '08:00';
    const horaFin = config?.horaFin || '17:00';
    const intervalo = config?.intervaloMinutos || 30;
    const diasAtencion = config?.diasAtencion || 'LUNES,MIERCOLES,VIERNES';

    const diaCita = this.normalizarTexto(this.obtenerDiaSemana(fecha));
    const diasPermitidos = diasAtencion
      .split(',')
      .map((dia) => this.normalizarTexto(dia))
      .filter(Boolean);

    if (!diasPermitidos.includes(diaCita)) {
      return [];
    }

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