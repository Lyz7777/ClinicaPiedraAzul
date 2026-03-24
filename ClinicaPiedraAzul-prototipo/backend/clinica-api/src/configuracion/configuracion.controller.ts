import { Controller, Get, Put, Body } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';

@Controller('configuracion')
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