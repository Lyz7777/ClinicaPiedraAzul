import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Contraseña para administrador (usuario: administrador)
  const adminHash = await bcrypt.hash('1234', 10);
  await prisma.usuario.update({
    where: { username: 'administrador' },
    data: { password: adminHash, role: 'admin' },
  });

  // Contraseña para agendador (usuario: admin)
  const agendadorHash = await bcrypt.hash('admin', 10);
  await prisma.usuario.update({
    where: { username: 'admin' },
    data: { password: agendadorHash, role: 'agendador' },
  });

  // Paciente (por si acaso)
  const pacienteHash = await bcrypt.hash('1234', 10);
  await prisma.usuario.update({
    where: { username: 'paciente' },
    data: { password: pacienteHash, role: 'patient' },
  });

  console.log('✅ Contraseñas actualizadas correctamente');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());