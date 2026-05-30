import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfiguracionService {
  constructor(private prismaService: PrismaService) {}

  async getConfiguracionGlobal() {
    let config = await this.prismaService.configuracionGlobal.findFirst();
    if (!config) config = await this.prismaService.configuracionGlobal.create({ data: { ventanaSemanas: 4 } });
    return config;
  }

  async updateConfiguracionGlobal(ventanaSemanas: number) {
    const config = await this.prismaService.configuracionGlobal.findFirst();
    if (config) {
      return this.prismaService.configuracionGlobal.update({ where: { id: config.id }, data: { ventanaSemanas } });
    } else {
      return this.prismaService.configuracionGlobal.create({ data: { ventanaSemanas } });
    }
  }
}