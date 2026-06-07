import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  // ========== ENDPOINTS PÚBLICOS ==========

  @Post('public/crear')
  async crearPacientePublic(@Body() body: CreatePacienteDto) {
    // Validar que no exista el mismo documento
    const existingDoc = await this.pacientesService['prismaService'].paciente.findUnique({
      where: { documento: body.documento }
    });
    
    if (existingDoc) {
      throw new BadRequestException('Ya existe un paciente con ese documento de identidad');
    }
    
    // Validar que no exista el mismo celular
    const existingCelular = await this.pacientesService['prismaService'].paciente.findFirst({
      where: { celular: body.celular }
    });
    
    if (existingCelular) {
      throw new BadRequestException('El número de celular ya está registrado');
    }
    
    return this.pacientesService.create(body);
  }

  // ========== ENDPOINTS PROTEGIDOS ==========

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador')
  getPacientes(@Query('order') order?: 'asc' | 'desc') {
    return this.pacientesService.findAll(order);
  }

  @Get('documento/:documento')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'paciente', 'medico')
  getPacienteByDocumento(@Param('documento') documento: string, @Req() req: any) {
    if (req.user.role === 'paciente') {
      return this.pacientesService.findByAuth0Id(req.user.auth0Id);
    }
    return this.pacientesService.findByDocumento(documento);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'medico', 'paciente')
  async getMyPatient(@Req() req: any) {
    const paciente = await this.pacientesService.findByAuth0Id(req.user.auth0Id);
    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado para este usuario');
    }
    return paciente;
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador')
  getPaciente(@Param('id') id: string) {
    return this.pacientesService.findOne(Number(id));
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador', 'paciente')
  createPaciente(@Body() body: CreatePacienteDto) {
    return this.pacientesService.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'agendador')
  updatePaciente(@Param('id') id: string, @Body() body: UpdatePacienteDto) {
    return this.pacientesService.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  deletePaciente(@Param('id') id: string) {
    return this.pacientesService.remove(Number(id));
  }
}