import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MedicosService } from './medicos.service';

@Controller('medicos')
@UseGuards(AuthGuard('jwt'))
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  findAll(@Query('order') order?: 'asc' | 'desc') {
    return this.medicosService.findAll(order);
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
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { nombre?: string; especialidad?: string }) {
    return this.medicosService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.remove(id);
  }

  @Get(':id/configuracion')
  getConfiguracion(@Param('id', ParseIntPipe) id: number) {
    return this.medicosService.getConfiguracion(id);
  }

  @Put(':id/configuracion')
  saveConfiguracion(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.medicosService.saveConfiguracion(id, body);
  }
}