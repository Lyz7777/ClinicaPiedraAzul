import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Usuario legado para compatibilidad
  const hashedAdminPassword = await bcrypt.hash('admin', 10);
  
  await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedAdminPassword,
      role: 'admin',
    },
  });

  // Usuario alineado con el frontend
  const hashedAdministradorPassword = await bcrypt.hash('1234', 10);

  await prisma.usuario.upsert({
    where: { username: 'administrador' },
    update: {
      password: hashedAdministradorPassword,
      role: 'admin',
    },
    create: {
      username: 'administrador',
      password: hashedAdministradorPassword,
      role: 'admin',
    },
  });

  // Usuario paciente para pruebas integrales frontend/backend
  const hashedPacientePassword = await bcrypt.hash('1234', 10);

  await prisma.usuario.upsert({
    where: { username: 'paciente' },
    update: {
      password: hashedPacientePassword,
      role: 'patient',
    },
    create: {
      username: 'paciente',
      password: hashedPacientePassword,
      role: 'patient',
    },
  });
  
  console.log('Usuarios admin, administrador y paciente sincronizados');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });