import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicosService {
  constructor(private prismaService: PrismaService) {}

  async findAll(order: 'asc' | 'desc' = 'asc'): Promise<any[]> {
    try {
      const medicos = await this.prismaService.medico.findMany({
        orderBy: { nombre: order },
        include: { configuracion: true },
      });
      
      if (!medicos || !Array.isArray(medicos)) {
        return [];
      }
      
      return medicos.map((medico: any) => ({
        ...medico,
        configuracion: medico.configuracion ? {
          id: medico.configuracion.id,
          medicoId: medico.configuracion.medicoId,
          diasAtencion: medico.configuracion.diasAtencion ? medico.configuracion.diasAtencion.split(',') : [],
          horaInicio: medico.configuracion.horaInicio,
          horaFin: medico.configuracion.horaFin,
          intervaloMinutos: medico.configuracion.intervaloMinutos,
        } : null,
      }));
    } catch (error) {
      console.error('Error en findAll medicos:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const medico = await this.prismaService.medico.findUnique({
        where: { id },
        include: { configuracion: true },
      });
      
      if (!medico) {
        throw new NotFoundException('Médico no encontrado');
      }
      
      return {
        ...medico,
        configuracion: medico.configuracion ? {
          id: medico.configuracion.id,
          medicoId: medico.configuracion.medicoId,
          diasAtencion: medico.configuracion.diasAtencion ? medico.configuracion.diasAtencion.split(',') : [],
          horaInicio: medico.configuracion.horaInicio,
          horaFin: medico.configuracion.horaFin,
          intervaloMinutos: medico.configuracion.intervaloMinutos,
        } : null,
      };
    } catch (error) {
      console.error(`Error en findOne medico ${id}:`, error);
      throw error;
    }
  }

  async create(data: { nombre: string; especialidad: string }): Promise<any> {
    try {
      return await this.prismaService.medico.create({ data });
    } catch (error) {
      console.error('Error en create medico:', error);
      throw error;
    }
  }

  async update(id: number, data: { nombre?: string; especialidad?: string }): Promise<any> {
    try {
      await this.findOne(id);
      return await this.prismaService.medico.update({ where: { id }, data });
    } catch (error) {
      console.error(`Error en update medico ${id}:`, error);
      throw error;
    }
  }

  async remove(id: number): Promise<any> {
    try {
      await this.findOne(id);
      return await this.prismaService.medico.delete({ where: { id } });
    } catch (error) {
      console.error(`Error en remove medico ${id}:`, error);
      throw error;
    }
  }

  async getConfiguracion(id: number): Promise<any> {
    try {
      await this.findOne(id);
      const config = await this.prismaService.configuracionMedico.findUnique({ 
        where: { medicoId: id } 
      });
      
      if (!config) {
        return {
          medicoId: id,
          diasAtencion: ['LUNES', 'MIÉRCOLES', 'VIERNES'],
          horaInicio: '08:00',
          horaFin: '17:00',
          intervaloMinutos: 30,
        };
      }
      
      return {
        ...config,
        diasAtencion: config.diasAtencion ? config.diasAtencion.split(',') : [],
      };
    } catch (error) {
      console.error(`Error en getConfiguracion medico ${id}:`, error);
      throw error;
    }
  }

  async saveConfiguracion(id: number, data: any): Promise<any> {
    try {
      await this.findOne(id);
      const diasAtencionString = Array.isArray(data.diasAtencion) 
        ? data.diasAtencion.join(',') 
        : data.diasAtencion;
      
      return await this.prismaService.configuracionMedico.upsert({
        where: { medicoId: id },
        update: {
          diasAtencion: diasAtencionString,
          horaInicio: data.horaInicio,
          horaFin: data.horaFin,
          intervaloMinutos: data.intervaloMinutos,
        },
        create: {
          medicoId: id,
          diasAtencion: diasAtencionString,
          horaInicio: data.horaInicio,
          horaFin: data.horaFin,
          intervaloMinutos: data.intervaloMinutos,
        },
      });
    } catch (error) {
      console.error(`Error en saveConfiguracion medico ${id}:`, error);
      throw error;
    }
  }
}