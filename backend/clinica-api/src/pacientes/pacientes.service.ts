import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(private prismaService: PrismaService) {}

  async findAll(order: 'asc' | 'desc' = 'asc'): Promise<any[]> {
    try {
      const pacientes = await this.prismaService.paciente.findMany({
        orderBy: { apellidos: order },
      });
      return pacientes || [];
    } catch (error) {
      console.error('Error en findAll pacientes:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<any> {
    const paciente = await this.prismaService.paciente.findUnique({ where: { id } });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');
    return paciente;
  }

  async findByDocumento(documento: string): Promise<any> {
    return this.prismaService.paciente.findUnique({ where: { documento } });
  }

  async findByAuth0Id(auth0Id: string): Promise<any> {
    return this.prismaService.paciente.findUnique({ where: { auth0Id } });
  }

  async create(data: CreatePacienteDto): Promise<any> {
    // Validar que no exista el mismo documento
    const existingDoc = await this.prismaService.paciente.findUnique({
      where: { documento: data.documento }
    });
    
    if (existingDoc) {
      throw new BadRequestException('Ya existe un paciente con ese documento de identidad');
    }
    
    // Validar que no exista el mismo celular
    const existingCelular = await this.prismaService.paciente.findFirst({
      where: { celular: data.celular }
    });
    
    if (existingCelular) {
      throw new BadRequestException('El número de celular ya está registrado');
    }
    
    // Si se envía auth0Id, verificar que no exista
    if (data.auth0Id) {
      const existingAuth0 = await this.prismaService.paciente.findUnique({
        where: { auth0Id: data.auth0Id }
      });
      
      if (existingAuth0) {
        // Si ya existe un paciente con ese auth0Id, lo actualizamos con los nuevos datos
        return this.prismaService.paciente.update({
          where: { auth0Id: data.auth0Id },
          data: {
            nombres: data.nombres,
            apellidos: data.apellidos,
            celular: data.celular,
            genero: data.genero,
            fechaNacimiento: data.fechaNacimiento,
            email: data.email,
            documento: data.documento
          }
        });
      }
    }
    
    return this.prismaService.paciente.create({ data });
  }

  async update(id: number, data: Partial<CreatePacienteDto>): Promise<any> {
    await this.findOne(id);
    
    // Validar que no exista otro paciente con el mismo celular
    if (data.celular) {
      const existing = await this.prismaService.paciente.findFirst({
        where: { celular: data.celular, NOT: { id } }
      });
      if (existing) {
        throw new BadRequestException('El número de celular ya está registrado por otro paciente');
      }
    }
    
    // Validar documento único
    if (data.documento) {
      const existingDoc = await this.prismaService.paciente.findFirst({
        where: { documento: data.documento, NOT: { id } }
      });
      if (existingDoc) {
        throw new BadRequestException('Ya existe otro paciente con ese documento de identidad');
      }
    }
    
    return this.prismaService.paciente.update({ where: { id }, data });
  }

  async remove(id: number): Promise<any> {
    await this.findOne(id);
    return this.prismaService.paciente.delete({ where: { id } });
  }
}