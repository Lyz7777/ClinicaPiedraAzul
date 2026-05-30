import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class CitasService {
  constructor(public readonly prismaService: PrismaService) {}

  private generarCodigoUnico(): string {
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `CITA-${random}`;
  }

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }

  private obtenerFechaLocal(fecha: string): Date {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    if (!anio || !mes || !dia) {
      throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
    }
    return new Date(anio, mes - 1, dia);
  }

  private obtenerDiaSemana(fecha: string): string {
    const fechaLocal = this.obtenerFechaLocal(fecha);
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[fechaLocal.getDay()];
  }

  private convertirHoraAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      throw new BadRequestException('La hora debe tener formato HH:mm');
    }
    return h * 60 + m;
  }

  private validarFechaPosteriorAHoy(fecha: string): void {
    const fechaCita = this.obtenerFechaLocal(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaCita <= hoy) {
      throw new BadRequestException('La fecha de la cita debe ser posterior a la fecha actual');
    }
  }

  private async validarVentanaSemanas(fecha: string): Promise<void> {
    const configGlobal = await this.prismaService.configuracionGlobal.findFirst();
    const ventanaSemanas = configGlobal?.ventanaSemanas ?? 4;
    
    const fechaCita = this.obtenerFechaLocal(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaMaxima = new Date();
    fechaMaxima.setDate(hoy.getDate() + (ventanaSemanas * 7));
    fechaMaxima.setHours(23, 59, 59, 999);
    
    if (fechaCita > fechaMaxima) {
      throw new BadRequestException(
        `Solo se pueden agendar citas hasta ${ventanaSemanas} semanas en el futuro ` +
        `(máximo: ${fechaMaxima.toISOString().split('T')[0]})`
      );
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    order: 'asc' | 'desc' = 'asc',
    medicoId?: number,
    fecha?: string,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const where: { medicoId?: number; fecha?: string } = {};
    if (typeof medicoId === 'number' && !isNaN(medicoId)) where.medicoId = medicoId;
    if (fecha) where.fecha = fecha;
    const [citas, total] = await Promise.all([
      this.prismaService.cita.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fecha: order }, { hora: order }],
        include: { paciente: true, medico: { include: { configuracion: true } } },
      }),
      this.prismaService.cita.count({ where }),
    ]);
    return { data: citas, total, page, totalPages: Math.ceil(total / limit), limit };
  }

  async findByMedicoId(medicoId: number, fecha?: string): Promise<any> {
    const medico = await this.prismaService.medico.findUnique({ 
      where: { id: medicoId },
      include: { configuracion: true }
    });
    if (!medico) {
      throw new NotFoundException('Médico no encontrado');
    }

    const where: { medicoId: number; fecha?: string } = { medicoId };
    if (fecha) where.fecha = fecha;

    const citas = await this.prismaService.cita.findMany({
      where,
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
      include: { paciente: true, medico: { include: { configuracion: true } } },
    });

    return {
      data: citas,
      total: citas.length,
      medico: {
        id: medico.id,
        nombre: medico.nombre,
        especialidad: medico.especialidad,
        configuracion: medico.configuracion,
      },
    };
  }

  async findByMedicoAuth0Id(auth0Id: string, page: number, limit: number, fecha?: string): Promise<any> {
    const medico = await this.prismaService.medico.findUnique({ where: { auth0Id } });
    if (!medico) {
      throw new NotFoundException('Médico no encontrado para este usuario');
    }

    const skip = (page - 1) * limit;
    const where: { medicoId: number; fecha?: string } = { medicoId: medico.id };
    if (fecha) where.fecha = fecha;

    const [citas, total] = await Promise.all([
      this.prismaService.cita.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
        include: { paciente: true, medico: { include: { configuracion: true } } },
      }),
      this.prismaService.cita.count({ where }),
    ]);

    return { data: citas, total, page, totalPages: Math.ceil(total / limit), limit };
  }

  async findByPacienteAuth0Id(auth0Id: string, page: number, limit: number, fecha?: string): Promise<any> {
    const paciente = await this.prismaService.paciente.findUnique({ where: { auth0Id } });
    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado para este usuario');
    }

    const skip = (page - 1) * limit;
    const where: { pacienteId: number; fecha?: string } = { pacienteId: paciente.id };
    if (fecha) where.fecha = fecha;

    const [citas, total] = await Promise.all([
      this.prismaService.cita.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
        include: { paciente: true, medico: { include: { configuracion: true } } },
      }),
      this.prismaService.cita.count({ where }),
    ]);

    return { data: citas, total, page, totalPages: Math.ceil(total / limit), limit };
  }

  async findByDocumentoPaciente(documento: string, fecha?: string): Promise<any> {
    const paciente = await this.prismaService.paciente.findUnique({
      where: { documento },
    });

    if (!paciente) {
      throw new NotFoundException('No se encontró un paciente con ese documento');
    }

    const where: { pacienteId: number; fecha?: string } = { pacienteId: paciente.id };
    if (fecha) where.fecha = fecha;

    const citas = await this.prismaService.cita.findMany({
      where,
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
      include: {
        paciente: true,
        medico: {
          include: { configuracion: true },
        },
      },
    });

    return {
      data: citas,
      total: citas.length,
      paciente: {
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        documento: paciente.documento,
      },
    };
  }

  async findOne(id: number): Promise<any> {
    const cita = await this.prismaService.cita.findUnique({
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
  }): Promise<any> {
    this.validarFechaPosteriorAHoy(data.fecha);
    await this.validarVentanaSemanas(data.fecha);

    const paciente = await this.prismaService.paciente.findUnique({
      where: { id: data.pacienteId }
    });
    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const medico = await this.prismaService.medico.findUnique({
      where: { id: data.medicoId },
      include: { configuracion: true },
    });
    if (!medico) throw new NotFoundException('Médico no encontrado');

    const diasAtencion = medico.configuracion?.diasAtencion ?? 'LUNES,MIERCOLES,VIERNES';
    const horaInicio = medico.configuracion?.horaInicio ?? '08:00';
    const horaFin = medico.configuracion?.horaFin ?? '17:00';
    const intervalo = medico.configuracion?.intervaloMinutos ?? 30;

    const diaCita = this.normalizarTexto(this.obtenerDiaSemana(data.fecha));
    const diasPermitidos = diasAtencion.split(',').map((d: string) => this.normalizarTexto(d));
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

    const citaExistente = await this.prismaService.cita.findFirst({
      where: { medicoId: data.medicoId, fecha: data.fecha, hora: data.hora },
    });
    if (citaExistente) {
      throw new BadRequestException('Ya existe una cita agendada para ese médico en esa fecha y hora');
    }

    const codigoVerificacion = this.generarCodigoUnico();

    return this.prismaService.cita.create({
      data: {
        fecha: data.fecha,
        hora: data.hora,
        pacienteId: data.pacienteId,
        medicoId: data.medicoId,
        descripcion: data.descripcion,
        estado: data.estado || 'AGENDADA',
        codigoVerificacion,
      },
      include: { paciente: true, medico: true },
    });
  }

  async update(id: number, data: any): Promise<any> {
    await this.findOne(id);
    return this.prismaService.cita.update({ where: { id }, data });
  }

  async remove(id: number): Promise<any> {
    await this.findOne(id);
    return this.prismaService.cita.delete({ where: { id } });
  }

  async getHorasDisponibles(medicoId: number, fecha: string): Promise<string[]> {
    this.validarFechaPosteriorAHoy(fecha);
    const config = await this.prismaService.configuracionMedico.findUnique({ where: { medicoId } });
    const horaInicio = config?.horaInicio || '08:00';
    const horaFin = config?.horaFin || '17:00';
    const intervalo = config?.intervaloMinutos || 30;
    const diasAtencion = config?.diasAtencion || 'LUNES,MIERCOLES,VIERNES';

    const diaCita = this.normalizarTexto(this.obtenerDiaSemana(fecha));
    const diasPermitidos = diasAtencion.split(',').map((d: string) => this.normalizarTexto(d));
    if (!diasPermitidos.includes(diaCita)) return [];

    const citas = await this.prismaService.cita.findMany({
      where: { medicoId, fecha },
      select: { hora: true },
    });
    const horasOcupadas = citas.map((c: { hora: string }) => c.hora);
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

  async exportarCitasACSV(medicoId?: number, fecha?: string): Promise<string> {
    const where: { medicoId?: number; fecha?: string } = {};
    if (typeof medicoId === 'number' && !isNaN(medicoId)) where.medicoId = medicoId;
    if (fecha) where.fecha = fecha;
    const citas = await this.prismaService.cita.findMany({
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

    const filas = citas.map((cita: any) => [
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
      ...filas.map((fila: any[]) => fila.map((celda: any) => `"${celda}"`).join(',')),
    ].join('\n');
    return `\ufeff${csvContent}`;
  }

  async reagendarCita(
    id: number,
    nuevaFecha: string,
    nuevaHora: string,
    usuario: string,
    userRole?: string,
    userAuth0Id?: string,
  ): Promise<any> {
    const citaOriginal = await this.findOne(id);

    this.validarFechaPosteriorAHoy(nuevaFecha);
    await this.validarVentanaSemanas(nuevaFecha);

    if (userRole === 'medico') {
      let medico = null;
      
      if (userAuth0Id) {
        medico = await this.prismaService.medico.findUnique({
          where: { auth0Id: userAuth0Id },
        });
      }
      
      if (!medico) {
        medico = await this.prismaService.medico.findFirst({
          where: {
            OR: [
              { nombre: { contains: usuario } },
              { auth0Id: userAuth0Id || '' },
            ],
          },
        });
      }
      
      if (medico && citaOriginal.medicoId !== medico.id) {
        throw new ForbiddenException('No tienes permiso para reagendar esta cita');
      }
    }

    const medicoConfig = await this.prismaService.medico.findUnique({
      where: { id: citaOriginal.medicoId },
      include: { configuracion: true },
    });
    if (!medicoConfig) throw new NotFoundException('Médico no encontrado');

    const diaCita = this.normalizarTexto(this.obtenerDiaSemana(nuevaFecha));
    const diasAtencion = medicoConfig.configuracion?.diasAtencion ?? 'LUNES,MIERCOLES,VIERNES';
    const diasPermitidos = diasAtencion.split(',').map((d: string) => this.normalizarTexto(d));
    if (!diasPermitidos.includes(diaCita)) {
      throw new BadRequestException(`El médico no atiende el día ${diaCita}`);
    }

    const minutosCita = this.convertirHoraAMinutos(nuevaHora);
    const horaInicio = medicoConfig.configuracion?.horaInicio ?? '08:00';
    const horaFin = medicoConfig.configuracion?.horaFin ?? '17:00';
    const intervalo = medicoConfig.configuracion?.intervaloMinutos ?? 30;
    const minutosInicio = this.convertirHoraAMinutos(horaInicio);
    const minutosFin = this.convertirHoraAMinutos(horaFin);
    
    if (minutosCita < minutosInicio || minutosCita >= minutosFin) {
      throw new BadRequestException(`La hora debe estar dentro del horario del médico (${horaInicio} - ${horaFin})`);
    }
    if ((minutosCita - minutosInicio) % intervalo !== 0) {
      throw new BadRequestException(`La hora seleccionada no coincide con el intervalo de atención (${intervalo} minutos)`);
    }

    const citaExistente = await this.prismaService.cita.findFirst({
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

    if (citaOriginal.fecha !== nuevaFecha) {
      await this.prismaService.historialCita.create({
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
      await this.prismaService.historialCita.create({
        data: {
          citaId: id,
          campo: 'hora',
          valorAnterior: citaOriginal.hora,
          valorNuevo: nuevaHora,
          modificadoPor: usuario,
        },
      });
    }

    return this.prismaService.cita.update({
      where: { id },
      data: { fecha: nuevaFecha, hora: nuevaHora },
      include: { paciente: true, medico: true },
    });
  }

  async getHistorialByCitaId(citaId: number): Promise<any[]> {
    return this.prismaService.historialCita.findMany({
      where: { citaId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async validarCodigo(codigo: string): Promise<any> {
    const cita = await this.prismaService.cita.findFirst({
      where: { codigoVerificacion: codigo },
      include: { paciente: true, medico: true },
    });
    
    if (!cita) {
      throw new BadRequestException('Código inválido');
    }
    
    return {
      valido: true,
      cita: {
        paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
        medico: cita.medico.nombre,
        fecha: cita.fecha,
        hora: cita.hora,
      },
    };
  }
}