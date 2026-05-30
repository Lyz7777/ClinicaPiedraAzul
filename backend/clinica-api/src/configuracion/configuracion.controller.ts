import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConfiguracionService } from './configuracion.service';

@Controller('configuracion')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get('global')
  @Roles('admin', 'agendador', 'medico')
  async getConfiguracionGlobal() {
    return this.configuracionService.getConfiguracionGlobal();
  }

  @Put('global')
  @Roles('admin')
  async updateConfiguracionGlobal(@Body() body: { ventanaSemanas: number }) {
    return this.configuracionService.updateConfiguracionGlobal(body.ventanaSemanas);
  }
}