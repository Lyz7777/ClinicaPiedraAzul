import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, Req, Res,
  ParseIntPipe, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { MarcarAsistenciaDto } from './dto/marcar-asistencia.dto';
import { Response } from 'express';

@Controller('citas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Get('horas-disponibles')
  @Roles('admin', 'agendador', 'medico', 'paciente')
  async getHorasDisponibles(
    @Query('medicoId') medicoId: string,
    @Query('fecha') fecha: string,
  ) {
    if (!medicoId || !fecha) {
      throw new BadRequestException('medicoId y fecha son requeridos');
    }
    return this.citasService.getHorasDisponibles(parseInt(medicoId), fecha);
  }

  @Get('por-documento/:documento')
  @Roles('admin', 'agendador', 'paciente', 'medico')
  async getCitasPorDocumento(@Param('documento') documento: string, @Req() req: any) {
    if (req.user.role === 'paciente') {
      const paciente = await this.citasService['prismaService'].paciente.findUnique({
        where: { auth0Id: req.user.auth0Id }
      });
      if (paciente && paciente.documento !== documento) {
        throw new BadRequestException('Solo puedes ver tus propias citas');
      }
    }
    return this.citasService.findByDocumentoPaciente(documento);
  }

  @Get('mis-citas')
  @Roles('admin', 'agendador', 'medico', 'paciente')
  async getMisCitas(@Req() req: any, @Query('fecha') fecha?: string) {
    const user = req.user;
    if (user.role === 'medico') {
      return this.citasService.findByMedicoAuth0Id(user.auth0Id, 1, 100, fecha);
    }
    if (user.role === 'paciente') {
      return this.citasService.findByPacienteAuth0Id(user.auth0Id, 1, 100, fecha);
    }
    return this.citasService.findAll(1, 100, 'asc', undefined, fecha);
  }

  @Get('exportar-csv')
  @Roles('admin', 'agendador', 'medico')
  async exportarCSV(
    @Query('medicoId') medicoId?: string,
    @Query('fecha') fecha?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.citasService.exportarCitasACSV(
      medicoId ? parseInt(medicoId) : undefined,
      fecha,
    );
    res?.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res?.setHeader('Content-Disposition', `attachment; filename=citas${fecha ? '_' + fecha : ''}.csv`);
    res?.send(csv);
  }

  @Get('medico/:auth0Id')
  @Roles('medico', 'admin', 'agendador')
  async getCitasByMedico(@Param('auth0Id') auth0Id: string, @Query('fecha') fecha?: string) {
    return this.citasService.findByMedicoAuth0Id(auth0Id, 1, 100, fecha);
  }

  @Get('medico-id/:medicoId')
  @Roles('admin', 'agendador', 'medico')
  async getCitasByMedicoId(@Param('medicoId', ParseIntPipe) medicoId: number, @Query('fecha') fecha?: string) {
    return this.citasService.findByMedicoId(medicoId, fecha);
  }

  @Get()
  @Roles('admin', 'agendador')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('medicoId') medicoId?: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.citasService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      order || 'asc',
      medicoId ? parseInt(medicoId) : undefined,
      fecha,
    );
  }

  @Get(':id/historial')
  @Roles('admin', 'agendador', 'medico', 'paciente')
  async getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.getHistorialByCitaId(id);
  }

  @Get(':id')
  @Roles('admin', 'agendador', 'medico', 'paciente')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.findOne(id);
  }

  @Post()
  @Roles('admin', 'agendador')
  async create(@Body() body: CreateCitaDto) {
    return this.citasService.create(body);
  }

  @Post('agendar')
  @Roles('paciente', 'admin', 'agendador')
  async agendarCita(@Body() body: CreateCitaDto, @Req() req: any) {
    if (req.user.role === 'paciente') {
      const paciente = await this.citasService['prismaService'].paciente.findUnique({
        where: { auth0Id: req.user.auth0Id }
      });
      if (!paciente) {
        throw new BadRequestException('No se encontró un perfil de paciente asociado a tu cuenta');
      }
      body.pacienteId = paciente.id;
    }
    return this.citasService.create(body);
  }

  @Post('validar-codigo')
  @Roles('admin', 'agendador', 'medico')
  async validarCodigo(@Body() body: { codigo: string }) {
    if (!body.codigo) {
      throw new BadRequestException('El código es requerido');
    }
    return this.citasService.validarCodigo(body.codigo);
  }

  @Put(':id/reagendar')
  @Roles('admin', 'agendador', 'medico')
  async reagendar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { fecha: string; hora: string },
    @Req() req: any,
  ) {
    return this.citasService.reagendarCita(
      id,
      body.fecha,
      body.hora,
      req.user.nombre || req.user.email || 'Usuario',
      req.user.role,
      req.user.auth0Id,
    );
  }

  @Patch(':id')
  @Roles('admin', 'agendador', 'medico')
  async updateEstado(@Param('id', ParseIntPipe) id: number, @Body() body: { estado: string }) {
    return this.citasService.update(id, { estado: body.estado });
  }

  // NUEVO ENDPOINT: MARCAR ASISTENCIA
  @Patch(':id/asistencia')
  @Roles('admin', 'agendador', 'medico')
  async marcarAsistencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: MarcarAsistenciaDto,
    @Req() req: any,
  ) {
    return this.citasService.marcarAsistencia(
      id,
      body.asistio,
      req.user.nombre || req.user.email || req.user.auth0Id,
      body.metodo || 'MANUAL'
    );
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.remove(id);
  }
}