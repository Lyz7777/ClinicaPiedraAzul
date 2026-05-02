import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfiguracionService } from './configuracion.service';

@Controller('configuracion')
@UseGuards(AuthGuard('jwt'))
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get('global')
  async getConfiguracionGlobal() {
    return this.configuracionService.getConfiguracionGlobal();
  }

  @Put('global')
  async updateConfiguracionGlobal(@Body() body: { ventanaSemanas: number }) {
    return this.configuracionService.updateConfiguracionGlobal(body.ventanaSemanas);
  }
}