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

  // GET /medicos - Todos pueden ver la lista
  @Get()
  @Roles('admin', 'agendador', 'medico', 'paciente')
  findAll(@Query('order') order?: 'asc' | 'desc') {
    return this.medicosService.findAll(order);
  }

  // GET /medicos/:id - Todos pueden ver un médico específico
  @Get(':id')
  @Roles('admin', 'agendador', 'medico', 'paciente')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.findOne(id);
  }

  // POST /medicos - Solo admin puede crear
  @Post()
  @Roles('admin')
  create(@Body() body: CreateMedicoDto) {
    return this.medicosService.create(body);
  }

  // PUT /medicos/:id - Solo admin puede actualizar
  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMedicoDto) {
    return this.medicosService.update(id, body);
  }

  // DELETE /medicos/:id - Solo admin puede eliminar
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.remove(id);
  }

  // GET /medicos/:id/configuracion - Todos pueden ver la configuración
  @Get(':id/configuracion')
  @Roles('admin', 'agendador', 'medico', 'paciente')
  getConfiguracion(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.getConfiguracion(id);
  }

  // PUT /medicos/:id/configuracion - Solo admin puede modificar
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