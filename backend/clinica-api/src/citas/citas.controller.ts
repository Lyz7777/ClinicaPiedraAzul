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
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  // ========== ENDPOINTS PÚBLICOS (sin autenticación) ==========
  
  @Get('public/horas-disponibles')
  async getHorasDisponiblesPublic(
    @Query('medicoId') medicoId: string,
    @Query('fecha') fecha: string,
  ) {
    if (!medicoId || !fecha) {
      throw new BadRequestException('medicoId y fecha son requeridos');
    }
    return this.citasService.getHorasDisponibles(parseInt(medicoId), fecha);
  }

  @Get('public/medicos')
  async getMedicosPublic() {
    return this.citasService.getMedicosPublic();
  }

  @Post('public/agendar')
  async agendarCitaPublic(@Body() body: CreateCitaDto) {
    console.log('📅 Agendamiento público recibido:', body);
    return this.citasService.create(body);
  }

  @Get('public/paciente/:documento')
  async getPacientePorDocumentoPublic(@Param('documento') documento: string) {
    const paciente = await this.citasService['prismaService'].paciente.findUnique({
      where: { documento },
      select: {
        id: true,
        documento: true,
        nombres: true,
        apellidos: true,
        celular: true,
        email: true,
        genero: true,
        fechaNacimiento: true,
      }
    });
    
    if (!paciente) {
      return { existe: false, paciente: null };
    }
    
    return { existe: true, paciente };
  }

  @Get('public/por-documento/:documento')
  async getCitasPorDocumentoPublic(
    @Param('documento') documento: string,
    @Query('todas') todas?: string,
  ) {
    return this.citasService.findByDocumentoPaciente(documento, undefined, todas === 'true');
  }

  // ✅ NUEVO ENDPOINT PÚBLICO: Ver notas de una cita
  @Get('public/notas/:citaId')
  async getNotasPublic(@Param('citaId', ParseIntPipe) citaId: number) {
    return this.citasService.obtenerNotas(citaId);
  }

  // ========== ENDPOINTS PROTEGIDOS ==========

  @Get('horas-disponibles')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'paciente', 'medico')
  async getCitasPorDocumento(
    @Param('documento') documento: string,
    @Req() req: any,
    @Query('todas') todas?: string,
  ) {
    if (req.user.role === 'paciente') {
      const paciente = await this.citasService['prismaService'].paciente.findUnique({
        where: { auth0Id: req.user.auth0Id }
      });
      if (!paciente) {
        throw new BadRequestException('No tienes un perfil de paciente asociado a tu cuenta');
      }
      if (paciente.documento !== documento) {
        throw new BadRequestException('Solo puedes ver tus propias citas');
      }
    }
    const result = await this.citasService.findByDocumentoPaciente(documento, undefined, todas === 'true');
    return result;
  }

  @Get('mis-citas')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'medico', 'paciente')
  async getMisCitas(@Req() req: any, @Query('fecha') fecha?: string) {
    const user = req.user;
    if (user.role === 'paciente') {
      return this.citasService.findByPacienteAuth0Id(user.auth0Id, 1, 100, fecha);
    }
    return this.citasService.findAll(1, 100, 'asc', undefined, fecha);
  }

  @Get('exportar-csv')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'medico')
  async exportarCSV(
    @Query('medicoId') medicoId?: string,
    @Query('fecha') fecha?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.citasService.exportarCitasACSV(
      medicoId ? parseInt(medicoId) : undefined,
      fecha
    );
    res?.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res?.setHeader('Content-Disposition', `attachment; filename=citas${fecha ? `_${fecha}` : ''}.csv`);
    res?.send(csv);
  }

  @Get('medico/:auth0Id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('medico', 'admin', 'agendador')
  async getCitasByMedico(@Param('auth0Id') auth0Id: string, @Query('fecha') fecha?: string) {
    return this.citasService.findByMedicoAuth0Id(auth0Id, 1, 100, fecha);
  }

  @Get('medico-id/:medicoId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'medico')
  async getCitasByMedicoId(@Param('medicoId', ParseIntPipe) medicoId: number, @Query('fecha') fecha?: string) {
    return this.citasService.findByMedicoId(medicoId, fecha);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'medico')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'medico', 'paciente')
  async getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.getHistorialByCitaId(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'medico', 'paciente')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador')
  async create(@Body() body: CreateCitaDto) {
    return this.citasService.create(body);
  }

  @Post('agendar')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'medico')
  async validarCodigo(@Body() body: { codigo: string }) {
    if (!body.codigo) {
      throw new BadRequestException('El código es requerido');
    }
    return this.citasService.validarCodigo(body.codigo);
  }

  @Put(':id/reagendar')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'medico')
  async updateEstado(@Param('id', ParseIntPipe) id: number, @Body() body: { estado: string }) {
    return this.citasService.update(id, { estado: body.estado });
  }

  @Patch(':id/asistencia')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @Post(':id/notas')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('medico', 'admin')
  async agregarNota(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { contenido: string },
    @Req() req: any,
  ) {
    return this.citasService.agregarNota(
      id,
      body.contenido,
      req.user.nombre || req.user.email || req.user.auth0Id
    );
  }

  @Get(':id/notas')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('medico', 'admin', 'agendador')
  async obtenerNotas(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.obtenerNotas(id);
  }

  @Patch(':id/cancelar')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'medico', 'paciente')
  async cancelarCita(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.citasService.cancelarCita(id, req.user.role, req.user.auth0Id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.remove(id);
  }
}