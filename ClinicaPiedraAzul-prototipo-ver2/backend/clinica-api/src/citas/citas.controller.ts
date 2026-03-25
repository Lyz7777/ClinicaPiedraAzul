import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { CitasService } from './citas.service';

@Controller('citas')
export class CitasController {
  constructor(private readonly service: CitasService) {}

  @Get()
  findAll(@Query('medicoId') medicoId?: string, @Query('fecha') fecha?: string) {
    if (medicoId && fecha) {
      return this.service.getByMedicoAndFecha(Number(medicoId), fecha);
    }
    return this.service.findAll();
  }

  @Get('horas-disponibles')
  getHorasDisponibles(
    @Query('medicoId') medicoId: string,
    @Query('fecha') fecha: string,
  ) {
    return this.service.getHorasDisponibles(Number(medicoId), fecha);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}