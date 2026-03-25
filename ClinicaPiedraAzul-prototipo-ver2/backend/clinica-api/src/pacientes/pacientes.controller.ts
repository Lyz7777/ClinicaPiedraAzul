import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()
  getPacientes() {
    return this.pacientesService.findAll();
  }

  @Get('documento/:documento')
  getPacienteByDocumento(@Param('documento') documento: string) {
    return this.pacientesService.findByDocumento(documento);
  }

  @Get(':id')
  getPaciente(@Param('id') id: string) {
    return this.pacientesService.findOne(Number(id));
  }

  @Post()
  createPaciente(@Body() body: CreatePacienteDto) {
    return this.pacientesService.create(body);
  }

  @Put(':id')
  updatePaciente(@Param('id') id: string, @Body() body: CreatePacienteDto) {
    return this.pacientesService.update(Number(id), body);
  }

  @Delete(':id')
  deletePaciente(@Param('id') id: string) {
    return this.pacientesService.remove(Number(id));
  }
}