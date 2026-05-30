import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prismaService: PrismaService) {}

  async findOrCreateUserFromAuth0(auth0Payload: any) {
    const auth0Id = auth0Payload.sub;
    
    // ===== EXTRAER EMAIL =====
    let email = auth0Payload.email;
    if (!email) {
      email = `${auth0Id.replace(/\|/g, '_')}@auth0.local`;
      this.logger.warn(`⚠️ Usuario ${auth0Id} no tiene email. Usando fallback: ${email}`);
    }
    
    // ===== EXTRAER NOMBRE =====
    let nombre = auth0Payload.name || 
                 auth0Payload.nickname || 
                 auth0Payload.user_id ||
                 email.split('@')[0] ||
                 'Usuario';
    
    // ===== EXTRAER USERNAME =====
    let username = auth0Payload.nickname || 
                   auth0Payload.name || 
                   auth0Payload.preferred_username;
    
    if (!username) {
      username = email.split('@')[0];
    }
    
    // ===== EXTRAER ROLES (normalizados) =====
    const rolesClaim = auth0Payload['https://piedrazul.com/roles'] || [];
    let role = 'paciente';
    
    // Normalización de roles: admin, agendador, medico, paciente
    for (const r of rolesClaim) {
      const roleLower = r.toLowerCase();
      if (roleLower === 'admin' || roleLower === 'administrador') {
        role = 'admin';
        break;
      }
      if (roleLower === 'scheduler' || roleLower === 'sheduler' || roleLower === 'agendador') {
        role = 'agendador';
        break;
      }
      if (roleLower === 'medico' || roleLower === 'terapista') {
        role = 'medico';
        break;
      }
      if (roleLower === 'patient' || roleLower === 'paciente') {
        role = 'paciente';
      }
    }
    
    this.logger.log(`👤 Procesando usuario: ${auth0Id} | email: ${email} | username base: ${username} | rol: ${role}`);

    // ===== BUSCAR USUARIO EXISTENTE =====
    let usuario = await this.prismaService.usuario.findFirst({
      where: {
        OR: [
          { auth0Id: auth0Id },
          { email: email },
          { username: username }
        ]
      },
    });

    // ===== SI EXISTE, ACTUALIZAR Y RETORNAR =====
    if (usuario) {
      this.logger.log(`✅ Usuario ya existe: ${usuario.id} (${usuario.username})`);
      
      if (usuario.role !== role) {
        usuario = await this.prismaService.usuario.update({
          where: { id: usuario.id },
          data: { role }
        });
        this.logger.log(`🔄 Rol actualizado a ${role}`);
      }
      
      return {
        id: usuario.id,
        auth0Id: usuario.auth0Id,
        email: usuario.email,
        username: usuario.username,
        nombre: usuario.nombre,
        role: usuario.role,
      };
    }

    // ===== SI NO EXISTE, CREAR NUEVO =====
    let finalUsername = username;
    let counter = 1;
    while (await this.prismaService.usuario.findUnique({ where: { username: finalUsername } })) {
      finalUsername = `${username}_${counter}`;
      counter++;
    }
    
    try {
      usuario = await this.prismaService.usuario.create({
        data: {
          auth0Id,
          email,
          username: finalUsername,
          nombre,
          role,
        },
      });
      this.logger.log(`✅ Usuario creado: ${auth0Id} (${finalUsername}) con rol ${role}`);
    } catch (error: any) {
      this.logger.error(`❌ Error creando usuario: ${error.message}`);
      const fallbackEmail = `user_${Date.now()}@auth0.local`;
      usuario = await this.prismaService.usuario.create({
        data: {
          auth0Id,
          email: fallbackEmail,
          username: finalUsername,
          nombre,
          role,
        },
      });
    }

    return {
      id: usuario.id,
      auth0Id: usuario.auth0Id,
      email: usuario.email,
      username: usuario.username,
      nombre: usuario.nombre,
      role: usuario.role,
    };
  }
}