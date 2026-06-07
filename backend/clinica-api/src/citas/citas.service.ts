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
        `Solo se pueden agendar citas hasta ${ventanaSemanas} semanas en el futuro`
      );
    }
  }

  // ========== MÉTODO NUEVO PÚBLICO PARA OBTENER MÉDICOS ==========
  async getMedicosPublic(): Promise<any[]> {
    try {
      const medicos = await this.prismaService.medico.findMany({
        orderBy: { nombre: 'asc' },
        include: { configuracion: true },
      });
      
      return medicos.map((medico: any) => ({
        id: medico.id,
        nombre: medico.nombre,
        especialidad: medico.especialidad,
        configuracion: medico.configuracion ? {
          diasAtencion: medico.configuracion.diasAtencion ? medico.configuracion.diasAtencion.split(',') : [],
          horaInicio: medico.configuracion.horaInicio,
          horaFin: medico.configuracion.horaFin,
          intervaloMinutos: medico.configuracion.intervaloMinutos,
        } : null,
      }));
    } catch (error) {
      console.error('Error en getMedicosPublic:', error);
      return [];
    }
  }

  async findAll(page: number = 1, limit: number = 10, order: 'asc' | 'desc' = 'asc', medicoId?: number, fecha?: string): Promise<any> {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (medicoId) where.medicoId = medicoId;
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
    const medico = await this.prismaService.medico.findUnique({ where: { id: medicoId }, include: { configuracion: true } });
    if (!medico) throw new NotFoundException('Médico no encontrado');
    const where: any = { medicoId };
    if (fecha) where.fecha = fecha;
    const citas = await this.prismaService.cita.findMany({
      where,
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
      include: { paciente: true, medico: { include: { configuracion: true } } },
    });
    return { data: citas, total: citas.length, medico: { id: medico.id, nombre: medico.nombre, especialidad: medico.especialidad, configuracion: medico.configuracion } };
  }

  async findByMedicoAuth0Id(auth0Id: string, page: number, limit: number, fecha?: string): Promise<any> {
    const medico = await this.prismaService.medico.findUnique({ where: { auth0Id } });
    if (!medico) throw new NotFoundException('No hay un médico asociado a tu cuenta');
    const skip = (page - 1) * limit;
    const where: any = { medicoId: medico.id };
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
    return { data: citas, total, page, totalPages: Math.ceil(total / limit), limit, medico };
  }

  async findByPacienteAuth0Id(auth0Id: string, page: number, limit: number, fecha?: string): Promise<any> {
    const paciente = await this.prismaService.paciente.findUnique({ where: { auth0Id } });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');
    const skip = (page - 1) * limit;
    const where: any = { pacienteId: paciente.id };
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
    return { data: citas, total, page, totalPages: Math.ceil(total / limit), limit, paciente };
  }

  async findByDocumentoPaciente(documento: string, fecha?: string, todas: boolean = false): Promise<any> {
    const paciente = await this.prismaService.paciente.findUnique({ 
      where: { documento },
      include: { usuario: true }  
    });
    
    if (!paciente) {
      return { data: [], total: 0, paciente: null };
    }
    
    const where: any = { pacienteId: paciente.id };
    if (fecha) where.fecha = fecha;
    
    if (!todas) {
      where.estado = { notIn: ['CANCELADA', 'COMPLETADA'] };
    }
    
    const citas = await this.prismaService.cita.findMany({
      where,
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
      include: { 
        paciente: true, 
        medico: { include: { configuracion: true } } 
      },
    });
    
    return { 
      data: citas, 
      total: citas.length, 
      paciente: {
        id: paciente.id,
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        documento: paciente.documento,
        celular: paciente.celular,
        email: paciente.email
      }
    };
  }

  async findOne(id: number): Promise<any> {
    const cita = await this.prismaService.cita.findUnique({ 
      where: { id }, 
      include: { paciente: true, medico: { include: { configuracion: true } } } 
    });
    if (!cita) throw new NotFoundException('Cita no encontrada');
    return cita;
  }

  async create(data: { fecha: string; hora: string; pacienteId: number; medicoId: number; descripcion?: string; estado?: string }): Promise<any> {
    this.validarFechaPosteriorAHoy(data.fecha);
    await this.validarVentanaSemanas(data.fecha);
    
    const paciente = await this.prismaService.paciente.findUnique({ 
      where: { id: data.pacienteId } 
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');
    
    const medico = await this.prismaService.medico.findUnique({ 
      where: { id: data.medicoId }, 
      include: { configuracion: true } 
    });
    if (!medico) throw new NotFoundException('Médico no encontrado');
    
    const diasAtencion = medico.configuracion?.diasAtencion ?? 'LUNES,MIERCOLES,VIERNES';
    const horaInicio = medico.configuracion?.horaInicio ?? '08:00';
    const horaFin = medico.configuracion?.horaFin ?? '17:00';
    const intervalo = medico.configuracion?.intervaloMinutos ?? 30;
    const diaCita = this.normalizarTexto(this.obtenerDiaSemana(data.fecha));
    const diasPermitidos = diasAtencion.split(',').map((d: string) => this.normalizarTexto(d));
    
    if (!diasPermitidos.includes(diaCita)) {
      throw new BadRequestException(`El médico no atiende el día ${diaCita}. Días habilitados: ${diasPermitidos.join(', ')}`);
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
      where: { medicoId: data.medicoId, fecha: data.fecha, hora: data.hora } 
    });
    if (citaExistente) {
      throw new BadRequestException('Ya existe una cita agendada para ese médico en esa fecha y hora');
    }
    
    const codigoVerificacion = this.generarCodigoUnico();
    
    const nuevaCita = await this.prismaService.cita.create({
      data: {
        fecha: data.fecha,
        hora: data.hora,
        pacienteId: data.pacienteId,
        medicoId: data.medicoId,
        descripcion: data.descripcion,
        estado: data.estado || 'AGENDADA',
        codigoVerificacion,
      },
      include: { 
        paciente: true, 
        medico: true 
      },
    });
    
    return nuevaCita;
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
    const medico = await this.prismaService.medico.findUnique({ where: { id: medicoId }, include: { configuracion: true } });
    if (!medico) throw new NotFoundException('Médico no encontrado');
    const config = medico.configuracion;
    if (!config) return [];
    const horaInicio = config.horaInicio;
    const horaFin = config.horaFin;
    const intervalo = config.intervaloMinutos;
    const diasAtencion = config.diasAtencion;
    const diaCita = this.normalizarTexto(this.obtenerDiaSemana(fecha));
    const diasPermitidos = diasAtencion.split(',').map((d: string) => this.normalizarTexto(d));
    if (!diasPermitidos.includes(diaCita)) return [];
    const citas = await this.prismaService.cita.findMany({ where: { medicoId, fecha }, select: { hora: true } });
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
    const where: any = {};
    if (medicoId) where.medicoId = medicoId;
    if (fecha) where.fecha = fecha;
    const citas = await this.prismaService.cita.findMany({
      where,
      include: { paciente: true, medico: true },
      orderBy: { hora: 'asc' },
    });
    if (!citas.length) throw new BadRequestException('No hay citas para exportar');
    const columnas = ['ID Cita', 'Paciente', 'Documento', 'Celular', 'Médico', 'Especialidad', 'Fecha', 'Hora', 'Estado', 'Asistencia', 'Motivo'];
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
      cita.asistio ? 'Asistió' : 'Pendiente',
      cita.descripcion || '',
    ]);
    const csvContent = [columnas.join(','), ...filas.map((fila: any[]) => fila.map((celda: any) => `"${celda}"`).join(','))].join('\n');
    return `\ufeff${csvContent}`;
  }

  async reagendarCita(id: number, nuevaFecha: string, nuevaHora: string, usuario: string, userRole?: string, userAuth0Id?: string): Promise<any> {
    const citaOriginal = await this.findOne(id);
    this.validarFechaPosteriorAHoy(nuevaFecha);
    await this.validarVentanaSemanas(nuevaFecha);
    const medicoConfig = await this.prismaService.medico.findUnique({ where: { id: citaOriginal.medicoId }, include: { configuracion: true } });
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
        id: { not: id }
      }
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
          modificadoPor: usuario
        }
      });
    }
    if (citaOriginal.hora !== nuevaHora) {
      await this.prismaService.historialCita.create({
        data: {
          citaId: id,
          campo: 'hora',
          valorAnterior: citaOriginal.hora,
          valorNuevo: nuevaHora,
          modificadoPor: usuario
        }
      });
    }
    return this.prismaService.cita.update({
      where: { id },
      data: { fecha: nuevaFecha, hora: nuevaHora },
      include: { paciente: true, medico: true }
    });
  }

  async getHistorialByCitaId(citaId: number): Promise<any[]> {
    return this.prismaService.historialCita.findMany({ where: { citaId }, orderBy: { createdAt: 'desc' } });
  }

  async validarCodigo(codigo: string): Promise<any> {
    const cita = await this.prismaService.cita.findFirst({
      where: { codigoVerificacion: codigo },
      include: { 
        paciente: true, 
        medico: true 
      }
    });
    
    if (!cita) {
      throw new BadRequestException('Código inválido');
    }
    
    return {
      valido: true,
      cita: {
        id: cita.id,
        paciente: `${cita.paciente.nombres} ${cita.paciente.apellidos}`,
        pacienteDocumento: cita.paciente.documento,
        pacienteCelular: cita.paciente.celular,
        medico: cita.medico.nombre,
        medicoEspecialidad: cita.medico.especialidad,
        fecha: cita.fecha,
        hora: cita.hora,
        asistio: cita.asistio,
        estado: cita.estado
      }
    };
  }

  async marcarAsistencia(id: number, asistio: boolean, usuario: string, metodo: string): Promise<any> {
    const cita = await this.findOne(id);
    if (cita.asistio === asistio) throw new BadRequestException('La cita ya tiene este estado de asistencia');
    await this.prismaService.historialCita.create({
      data: {
        citaId: id,
        campo: 'asistencia',
        valorAnterior: cita.asistio ? 'Asistió' : 'Pendiente',
        valorNuevo: asistio ? 'Asistió' : 'No asistió',
        modificadoPor: usuario,
      }
    });
    return this.prismaService.cita.update({
      where: { id },
      data: {
        asistio,
        asistioEn: asistio ? new Date() : null,
        asistioPor: usuario,
        asistioMetodo: metodo
      },
      include: { paciente: true, medico: true }
    });
  }

  async agregarNota(citaId: number, contenido: string, creadoPor: string) {
    const cita = await this.findOne(citaId);
    const fecha = new Date().toLocaleString('es-CO');
    const separador = '\n' + '─'.repeat(60) + '\n';
    const nuevaNota = `[${fecha} - ${creadoPor}]:\n${contenido}${separador}`;
    const notasActualizadas = (cita.notasMedicas || '') + nuevaNota;
    
    await this.prismaService.historialCita.create({
      data: {
        citaId,
        campo: 'notaClinica',
        valorAnterior: 'Nueva nota agregada',
        valorNuevo: contenido.substring(0, 100),
        modificadoPor: creadoPor,
      }
    });
    
    return this.prismaService.cita.update({
      where: { id: citaId },
      data: { notasMedicas: notasActualizadas },
      include: { paciente: true, medico: true }
    });
  }

  async obtenerNotas(citaId: number) {
    const cita = await this.findOne(citaId);
    const notasRaw = cita.notasMedicas || '';
    
    if (!notasRaw.trim()) {
      return [];
    }
    
    const notas = [];
    const separador = '─'.repeat(60);
    const bloques = notasRaw.split(separador);
    
    for (let i = 0; i < bloques.length; i++) {
      const bloque = bloques[i].trim();
      if (!bloque) continue;
      
      const match = bloque.match(/\[(.*?) - (.*?)\]:\n([\s\S]*)/);
      if (match) {
        notas.push({
          id: i,
          contenido: match[3].trim(),
          creadoPor: match[2],
          creadoEn: match[1],
          editado: false,
        });
      } else if (bloque) {
        notas.push({
          id: i,
          contenido: bloque,
          creadoPor: 'Sistema',
          creadoEn: new Date().toISOString(),
          editado: false,
        });
      }
    }
    
    return notas.reverse();
  }

  async cancelarCita(id: number, userRole: string, userAuth0Id: string): Promise<any> {
    const cita = await this.findOne(id);
    
    if (userRole === 'paciente') {
      const paciente = await this.prismaService.paciente.findUnique({ where: { auth0Id: userAuth0Id } });
      if (!paciente || cita.pacienteId !== paciente.id) {
        throw new ForbiddenException('No puedes cancelar una cita que no te pertenece');
      }
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaCita = this.obtenerFechaLocal(cita.fecha);
      const diffDias = Math.ceil((fechaCita.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDias < 2) {
        throw new BadRequestException('Solo puedes cancelar citas con al menos 2 días de anticipación');
      }
    }
    
    if (cita.estado === 'CANCELADA') {
      throw new BadRequestException('La cita ya está cancelada');
    }
    
    await this.prismaService.historialCita.create({
      data: {
        citaId: id,
        campo: 'estado',
        valorAnterior: cita.estado,
        valorNuevo: 'CANCELADA',
        modificadoPor: userRole === 'paciente' ? 'Paciente' : userRole,
      }
    });
    
    return this.prismaService.cita.update({
      where: { id },
      data: { estado: 'CANCELADA' },
      include: { paciente: true, medico: true }
    });
  }
}