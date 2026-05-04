import { Controller, Get, Post, Put, Delete, Body, Param, Query, Res, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Response } from 'express';
import { CitasService } from './citas.service';

@Controller('citas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CitasController {
  constructor(private readonly service: CitasService) {}

  @Get()
  @Roles('admin', 'agendador')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const orderBy = order === 'desc' ? 'desc' : 'asc';
    return this.service.findAll(pageNumber, limitNumber, orderBy);
  }

  @Get('horas-disponibles')
  @Roles('admin', 'agendador')
  getHorasDisponibles(@Query('medicoId') medicoId: string, @Query('fecha') fecha: string) {
    return this.service.getHorasDisponibles(Number(medicoId), fecha);
  }

  @Get('exportar-csv')
  @Roles('admin', 'agendador')
  async exportarCsv(@Query('medicoId') medicoId: string, @Query('fecha') fecha: string, @Res() res: Response) {
    try {
      const medicoIdNumber = medicoId ? Number(medicoId) : undefined;
      const csv = await this.service.exportarCitasACSV(medicoIdNumber, fecha || undefined);
      const nombrePartes = [
        'citas',
        medicoIdNumber ? `medico_${medicoIdNumber}` : null,
        fecha || null,
      ].filter(Boolean);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${nombrePartes.join('_')}.csv`);
      res.send(csv);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error interno';
      if (mensaje.includes('No hay citas')) {
        res.status(400).json({ statusCode: 400, message: mensaje });
      } else {
        console.error('Error al exportar CSV:', err);
        res.status(500).json({ statusCode: 500, message: mensaje });
      }
    }
  }

  @Get(':id')
  @Roles('admin', 'agendador')
  findOne(@Param('id') id: string) {
    const idNumber = Number(id);
    if (isNaN(idNumber)) throw new BadRequestException('El id debe ser un número');
    return this.service.findOne(idNumber);
  }

  @Post()
  @Roles('admin', 'agendador')
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  @Roles('admin', 'agendador')
  update(@Param('id') id: string, @Body() body: any) {
    const idNumber = Number(id);
    if (isNaN(idNumber)) throw new BadRequestException('El id debe ser un número');
    return this.service.update(idNumber, body);
  }

  @Delete(':id')
  @Roles('admin', 'agendador')
  delete(@Param('id') id: string) {
    const idNumber = Number(id);
    if (isNaN(idNumber)) throw new BadRequestException('El id debe ser un número');
    return this.service.remove(idNumber);
  }

  @Put(':id/reagendar')
  @Roles('admin', 'agendador')
  async reagendarCita(
    @Param('id') id: string,
    @Body() body: { fecha: string; hora: string },
    @Req() req: any,
  ) {
    const idNumber = Number(id);
    if (isNaN(idNumber)) throw new BadRequestException('El id debe ser un número');
    const usuario = req.user?.username || 'sistema';
    return this.service.reagendarCita(idNumber, body.fecha, body.hora, usuario);
  }

  @Get(':id/historial')
  @Roles('admin', 'agendador')
  async getHistorial(@Param('id') id: string) {
    const idNumber = Number(id);
    if (isNaN(idNumber)) throw new BadRequestException('El id debe ser un número');
    return this.service.getHistorialByCitaId(idNumber);
  }
}