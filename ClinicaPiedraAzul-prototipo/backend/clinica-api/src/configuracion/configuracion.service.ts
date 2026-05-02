import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfiguracionService {
  constructor(private prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.prisma;
  }

  async getConfiguracionGlobal() {
    let config = await this.prisma.configuracionGlobal.findFirst();
    if (!config) config = await this.prisma.configuracionGlobal.create({ data: { ventanaSemanas: 4 } });
    return config;
  }

  async updateConfiguracionGlobal(ventanaSemanas: number) {
    const config = await this.prisma.configuracionGlobal.findFirst();
    if (config) {
      return this.prisma.configuracionGlobal.update({ where: { id: config.id }, data: { ventanaSemanas } });
    } else {
      return this.prisma.configuracionGlobal.create({ data: { ventanaSemanas } });
    }
  }
}