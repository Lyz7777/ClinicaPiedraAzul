import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prismaService: PrismaService) {}

  async findOrCreateUserFromAuth0(auth0Payload: any) {
    const auth0Id = auth0Payload.sub;
    let email = auth0Payload.email || `${auth0Id.replace(/\|/g, '_')}@auth0.local`;
    let nombre = auth0Payload.name || auth0Payload.nickname || email.split('@')[0] || 'Usuario';
    let username = auth0Payload.nickname || auth0Payload.name || email.split('@')[0];
    
    const rolesClaim = auth0Payload['https://piedrazul.com/roles'] || [];
    let role = 'paciente';
    
    for (const r of rolesClaim) {
      const roleLower = r.toLowerCase();
      if (roleLower === 'admin') { role = 'admin'; break; }
      if (roleLower === 'agendador') { role = 'agendador'; break; }
      if (roleLower === 'medico') { role = 'medico'; break; }
      if (roleLower === 'paciente') role = 'paciente';
    }
    
    this.logger.log(`👤 ${auth0Id} | rol: ${role}`);

    let usuario = await this.prismaService.usuario.findFirst({
      where: { OR: [{ auth0Id }, { email }, { username }] }
    });

    if (usuario) {
      if (usuario.role !== role) {
        usuario = await this.prismaService.usuario.update({ where: { id: usuario.id }, data: { role } });
      }
      
      // ✅ SOLO para médico se crea automáticamente (si no existe)
      if (role === 'medico') {
        const existe = await this.prismaService.medico.findUnique({ where: { auth0Id } });
        if (!existe) {
          await this.prismaService.medico.create({ 
            data: { auth0Id, nombre, especialidad: 'Médico/Terapista', email } 
          });
          this.logger.log(`✅ Médico creado: ${nombre}`);
        }
      }
      
      // ❌ ELIMINADO: Ya no se crea paciente automáticamente
      // El paciente debe crearse desde el formulario de registro
      
      return { 
        id: usuario.id, 
        auth0Id: usuario.auth0Id, 
        email: usuario.email, 
        username: usuario.username, 
        nombre: usuario.nombre, 
        role: usuario.role 
      };
    }

    let finalUsername = username;
    let counter = 1;
    while (await this.prismaService.usuario.findUnique({ where: { username: finalUsername } })) {
      finalUsername = `${username}_${counter++}`;
    }
    
    usuario = await this.prismaService.usuario.create({ 
      data: { auth0Id, email, username: finalUsername, nombre, role } 
    });
    this.logger.log(`✅ Usuario creado: ${finalUsername} (${role})`);
    
    if (role === 'medico') {
      await this.prismaService.medico.create({ 
        data: { auth0Id, nombre, especialidad: 'Médico/Terapista', email } 
      });
      this.logger.log(`✅ Médico creado: ${nombre}`);
    }
    
    
    return { 
      id: usuario.id, 
      auth0Id: usuario.auth0Id, 
      email: usuario.email, 
      username: usuario.username, 
      nombre: usuario.nombre, 
      role: usuario.role 
    };
  }
}