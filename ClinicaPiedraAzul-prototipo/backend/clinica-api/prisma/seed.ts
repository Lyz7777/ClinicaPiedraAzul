import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Administrador
  const adminHash = await bcrypt.hash('1234', 10);
  await prisma.usuario.upsert({
    where: { username: 'administrador' },
    update: { password: adminHash, role: 'admin' },
    create: { username: 'administrador', password: adminHash, role: 'admin' },
  });

  // 2. Agendador
  const agendadorHash = await bcrypt.hash('admin', 10);
  await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: { password: agendadorHash, role: 'agendador' },
    create: { username: 'admin', password: agendadorHash, role: 'agendador' },
  });

  // 3. Paciente
  const pacienteHash = await bcrypt.hash('1234', 10);
  await prisma.usuario.upsert({
    where: { username: 'paciente' },
    update: { password: pacienteHash, role: 'patient' },
    create: { username: 'paciente', password: pacienteHash, role: 'patient' },
  });

  console.log('✅ Usuarios creados/actualizados correctamente');
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });