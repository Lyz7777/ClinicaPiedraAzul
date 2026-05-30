import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';

@Controller('medicos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  @Roles('admin', 'agendador', 'paciente', 'medico')
  findAll(@Query('order') order?: 'asc' | 'desc') {
    return this.medicosService.findAll(order);
  }

  @Get(':id')
  @Roles('admin', 'agendador', 'paciente', 'medico')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() body: CreateMedicoDto) {
    return this.medicosService.create(body);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMedicoDto) {
    return this.medicosService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.remove(id);
  }

  @Get(':id/configuracion')
  @Roles('admin', 'agendador', 'paciente', 'medico')
  getConfiguracion(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.getConfiguracion(id);
  }

  @Put(':id/configuracion')
  @Roles('admin')
  saveConfiguracion(@Param('id', ParseIntPipe) id: number, @Body() data: {
    diasAtencion: string[];
    horaInicio: string;
    horaFin: string;
    intervaloMinutos: number;
  }) {
    return this.medicosService.saveConfiguracion(id, data);
  }
}