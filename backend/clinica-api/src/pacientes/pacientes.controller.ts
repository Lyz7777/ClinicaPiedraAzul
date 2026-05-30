import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';

@Controller('pacientes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()
  @Roles('admin', 'agendador')
  getPacientes(@Query('order') order?: 'asc' | 'desc') {
    return this.pacientesService.findAll(order);
  }

  @Get('documento/:documento')
  @Roles('admin', 'agendador', 'paciente')  // ✅ AGREGADO 'paciente'
  getPacienteByDocumento(@Param('documento') documento: string) {
    return this.pacientesService.findByDocumento(documento);
  }

  @Get('me')
  @Roles('admin', 'agendador', 'medico', 'paciente')
  async getMyPatient(@Req() req: any) {
    const paciente = await this.pacientesService.findByAuth0Id(req.user.auth0Id);
    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado para este usuario');
    }
    return paciente;
  }

  @Get(':id')
  @Roles('admin', 'agendador')
  getPaciente(@Param('id') id: string) {
    return this.pacientesService.findOne(Number(id));
  }

  @Post()
  @Roles('admin', 'agendador', 'paciente')
  createPaciente(@Body() body: CreatePacienteDto) {
    return this.pacientesService.create(body);
  }

  @Put(':id')
  @Roles('admin', 'agendador')
  updatePaciente(@Param('id') id: string, @Body() body: CreatePacienteDto) {
    return this.pacientesService.update(Number(id), body);
  }

  @Delete(':id')
  @Roles('admin')
  deletePaciente(@Param('id') id: string) {
    return this.pacientesService.remove(Number(id));
  }
}