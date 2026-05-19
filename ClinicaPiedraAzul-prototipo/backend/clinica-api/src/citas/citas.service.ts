import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitasService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    if (!this.prismaService.prisma) {
      throw new Error('Prisma client no está disponible');
    }
    return this.prismaService.prisma;
  }

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
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      throw new BadRequestException('La hora debe tener formato HH:mm');
    }
    return h * 60 + m;
  }

  private validarFechaPosteriorAHoy(fecha: string) {
    const fechaCita = this.obtenerFechaLocal(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaCita <= hoy) {
      throw new BadRequestException('La fecha de la cita debe ser posterior a la fecha actual');
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    order: 'asc' | 'desc' = 'asc',
    medicoId?: number,
    fecha?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: { medicoId?: number; fecha?: string } = {};
    if (typeof medicoId === 'number' && !isNaN(medicoId)) where.medicoId = medicoId;
    if (fecha) where.fecha = fecha;
    const [citas, total] = await Promise.all([
      this.prisma.cita.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fecha: order }, { hora: order }],
        include: { paciente: true, medico: { include: { configuracion: true } } },
      }),
      this.prisma.cita.count({ where }),
    ]);
    return { data: citas, total, page, totalPages: Math.ceil(total / limit), limit };
  }

  async findByMedicoAuth0Id(auth0Id: string, page: number, limit: number, fecha?: string) {
    const medico = await this.prisma.medico.findUnique({ where: { auth0Id } });
    if (!medico) {
      throw new NotFoundException('Médico no encontrado para este usuario');
    }

    const skip = (page - 1) * limit;
    const where: { medicoId: number; fecha?: string } = { medicoId: medico.id };
    if (fecha) where.fecha = fecha;

    const [citas, total] = await Promise.all([
      this.prisma.cita.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
        include: { paciente: true, medico: { include: { configuracion: true } } },
      }),
      this.prisma.cita.count({ where }),
    ]);

    return { data: citas, total, page, totalPages: Math.ceil(total / limit), limit };
  }

  async findOne(id: number) {
    const cita = await this.prisma.cita.findUnique({
      where: { id },
      include: { paciente: true, medico: { include: { configuracion: true } } },
    });
    if (!cita) throw new NotFoundException('Cita no encontrada');
    return cita;
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
    if (!medico) throw new NotFoundException('Médico no encontrado');

    const diasAtencion = medico.configuracion?.diasAtencion ?? 'LUNES,MIERCOLES,VIERNES';
    const horaInicio = medico.configuracion?.horaInicio ?? '08:00';
    const horaFin = medico.configuracion?.horaFin ?? '17:00';
    const intervalo = medico.configuracion?.intervaloMinutos ?? 30;

    const diaCita = this.normalizarTexto(this.obtenerDiaSemana(data.fecha));
    const diasPermitidos = diasAtencion.split(',').map(d => this.normalizarTexto(d));
    if (!diasPermitidos.includes(diaCita)) {
      throw new BadRequestException(
        `El médico no atiende el día ${diaCita}. Días habilitados: ${diasPermitidos.join(', ')}`,
      );
    }

    const minutosCita = this.convertirHoraAMinutos(data.hora);
    const minutosInicio = this.convertirHoraAMinutos(horaInicio);
    const minutosFin = this.convertirHoraAMinutos(horaFin);
    if (minutosCita < minutosInicio || minutosCita >= minutosFin) {
      throw new BadRequestException(`La hora debe estar dentro del horario del médico (${horaInicio} - ${horaFin})`);
    }
    if ((minutosCita - minutosInicio) % intervalo !== 0) {
      throw new BadRequestException(`La hora seleccionada no coincide con el intervalo de atención (${intervalo} minutos)`);
    }

    const citaExistente = await this.prisma.cita.findFirst({
      where: { medicoId: data.medicoId, fecha: data.fecha, hora: data.hora },
    });
    if (citaExistente) {
      throw new BadRequestException('Ya existe una cita agendada para ese médico en esa fecha y hora');
    }

    return this.prisma.cita.create({
      data: {
        fecha: data.fecha,
        hora: data.hora,
        pacienteId: data.pacienteId,
        medicoId: data.medicoId,
        descripcion: data.descripcion,
        estado: data.estado,
      },
      include: { paciente: true, medico: true },
    });
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.prisma.cita.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cita.delete({ where: { id } });
  }

  async getByMedicoAndFecha(medicoId: number, fecha: string) {
    return this.prisma.cita.findMany({
      where: { medicoId, fecha },
      include: { paciente: true, medico: true },
    });
  }

  async getHorasDisponibles(medicoId: number, fecha: string) {
    this.validarFechaPosteriorAHoy(fecha);
    const config = await this.prisma.configuracionMedico.findUnique({ where: { medicoId } });
    const horaInicio = config?.horaInicio || '08:00';
    const horaFin = config?.horaFin || '17:00';
    const intervalo = config?.intervaloMinutos || 30;
    const diasAtencion = config?.diasAtencion || 'LUNES,MIERCOLES,VIERNES';

    const diaCita = this.normalizarTexto(this.obtenerDiaSemana(fecha));
    const diasPermitidos = diasAtencion.split(',').map(d => this.normalizarTexto(d));
    if (!diasPermitidos.includes(diaCita)) return [];

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
      const h = Math.floor(horaActual / 60);
      const m = horaActual % 60;
      const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      if (!horasOcupadas.includes(horaStr)) horasDisponibles.push(horaStr);
      horaActual += intervalo;
    }
    return horasDisponibles;
  }

  async exportarCitasACSV(medicoId?: number, fecha?: string) {
    const where: { medicoId?: number; fecha?: string } = {};
    if (typeof medicoId === 'number' && !isNaN(medicoId)) where.medicoId = medicoId;
    if (fecha) where.fecha = fecha;
    const citas = await this.prisma.cita.findMany({
      where,
      include: { paciente: true, medico: true },
      orderBy: { hora: 'asc' },
    });
    if (!citas.length) {
      throw new BadRequestException('No hay citas para exportar en la fecha seleccionada');
    }

    const columnas = [
      'ID Cita', 'Paciente', 'Documento', 'Celular',
      'Médico', 'Especialidad', 'Fecha', 'Hora', 'Estado', 'Motivo',
    ];

    const filas = citas.map(cita => [
      cita.id,
      `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
      cita.paciente.documento,
      cita.paciente.celular,
      cita.medico.nombre,
      cita.medico.especialidad,
      cita.fecha,
      cita.hora,
      cita.estado,
      cita.descripcion || '',
    ]);

    const csvContent = [
      columnas.join(','),
      ...filas.map(fila => fila.map(celda => `"${celda}"`).join(',')),
    ].join('\n');
    return `\ufeff${csvContent}`;
  }

  // ========== NUEVOS MÉTODOS (reagendamiento e historial) ==========
  async reagendarCita(
    id: number,
    nuevaFecha: string,
    nuevaHora: string,
    usuario: string,
    userRole?: string,
    userAuth0Id?: string,
  ) {
    const citaOriginal = await this.findOne(id);

    if (userRole === 'medico' && userAuth0Id) {
      const medico = await this.prisma.medico.findUnique({ where: { auth0Id: userAuth0Id } });
      if (!medico) {
        throw new NotFoundException('Médico no encontrado para este usuario');
      }
      if (citaOriginal.medicoId !== medico.id) {
        throw new ForbiddenException('No tienes permiso para reagendar esta cita');
      }
    }

    const medico = await this.prisma.medico.findUnique({
      where: { id: citaOriginal.medicoId },
      include: { configuracion: true },
    });
    if (!medico) throw new NotFoundException('Médico no encontrado');

    this.validarFechaPosteriorAHoy(nuevaFecha);

    const diaCita = this.normalizarTexto(this.obtenerDiaSemana(nuevaFecha));
    const diasAtencion = medico.configuracion?.diasAtencion ?? 'LUNES,MIERCOLES,VIERNES';
    const diasPermitidos = diasAtencion.split(',').map(d => this.normalizarTexto(d));
    if (!diasPermitidos.includes(diaCita)) {
      throw new BadRequestException(`El médico no atiende el día ${diaCita}`);
    }

    const minutosCita = this.convertirHoraAMinutos(nuevaHora);
    const horaInicio = medico.configuracion?.horaInicio ?? '08:00';
    const horaFin = medico.configuracion?.horaFin ?? '17:00';
    const intervalo = medico.configuracion?.intervaloMinutos ?? 30;
    const minutosInicio = this.convertirHoraAMinutos(horaInicio);
    const minutosFin = this.convertirHoraAMinutos(horaFin);
    if (minutosCita < minutosInicio || minutosCita >= minutosFin) {
      throw new BadRequestException(`La hora debe estar dentro del horario del médico (${horaInicio} - ${horaFin})`);
    }
    if ((minutosCita - minutosInicio) % intervalo !== 0) {
      throw new BadRequestException(`La hora seleccionada no coincide con el intervalo de atención (${intervalo} minutos)`);
    }

    const citaExistente = await this.prisma.cita.findFirst({
      where: {
        medicoId: citaOriginal.medicoId,
        fecha: nuevaFecha,
        hora: nuevaHora,
        id: { not: id },
      },
    });
    if (citaExistente) {
      throw new BadRequestException('Ya existe una cita para ese médico en esa fecha y hora');
    }

    // Registrar cambios en el historial
    if (citaOriginal.fecha !== nuevaFecha) {
      await (this.prisma as any).historialCita.create({
        data: {
          citaId: id,
          campo: 'fecha',
          valorAnterior: citaOriginal.fecha,
          valorNuevo: nuevaFecha,
          modificadoPor: usuario,
        },
      });
    }

    if (citaOriginal.hora !== nuevaHora) {
      await (this.prisma as any).historialCita.create({
        data: {
          citaId: id,
          campo: 'hora',
          valorAnterior: citaOriginal.hora,
          valorNuevo: nuevaHora,
          modificadoPor: usuario,
        },
      });
    }

    // Actualizar la cita
    return this.prisma.cita.update({
      where: { id },
      data: { fecha: nuevaFecha, hora: nuevaHora },
      include: { paciente: true, medico: true },
    });
  }

  async getHistorialByCitaId(citaId: number) {
    return (this.prisma as any).historialCita.findMany({
      where: { citaId },
      orderBy: { createdAt: 'desc' },
    });
  }
}