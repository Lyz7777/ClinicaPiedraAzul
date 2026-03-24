import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MedicosService } from './medicos.service';

@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  findAll() {
    return this.medicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.findOne(id);
  }

  @Post()
  create(@Body() body: { nombre: string; especialidad: string }) {
    return this.medicosService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nombre?: string; especialidad?: string }
  ) {
    return this.medicosService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.remove(id);
  }

  // Endpoints de configuración
  @Get(':id/configuracion')
  getConfiguracion(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.getConfiguracion(id);
  }

  @Put(':id/configuracion')
  saveConfiguracion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      diasAtencion: string[];
      horaInicio: string;
      horaFin: string;
      intervaloMinutos: number;
    }
  ) {
    return this.medicosService.saveConfiguracion(id, body);
  }
}