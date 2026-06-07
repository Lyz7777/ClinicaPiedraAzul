const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Usuarios base
  const usuarios = [
    { auth0Id: 'auth0|admin_default', username: 'administrador', email: 'admin@gmail.com', nombre: 'Administrador', role: 'admin' },
    { auth0Id: 'auth0|agendador_default', username: 'agendador', email: 'agendador@gmail.com', nombre: 'Agendador', role: 'agendador' },
    { auth0Id: 'auth0|paciente_default', username: 'paciente', email: 'paciente@gmail.com', nombre: 'Paciente Prueba', role: 'paciente' },
    { auth0Id: 'auth0|medico_default', username: 'medico', email: 'medico@gmail.com', nombre: 'Médico General', role: 'medico' },
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({ where: { username: usuario.username }, update: usuario, create: usuario });
    console.log(`✅ Usuario ${usuario.username}`);
  }

  // Paciente
  await prisma.paciente.upsert({
    where: { documento: '1002964972' },
    update: {},
    create: {
      documento: '1002964972',
      nombres: 'Laura',
      apellidos: 'Mera',
      celular: '3004336562',
      genero: 'Mujer',
      email: 'laura@email.com',
      auth0Id: 'auth0|paciente_default'
    }
  });
  console.log('✅ Paciente Laura Mera');

  // Médicos
  const medicos = [
    { nombre: 'Dra. Carolina Méndez', especialidad: 'Médico/Terapista', auth0Id: 'auth0|medico_carolina', email: 'carolina@clinica.com' },
    { nombre: 'Dr. Ricardo Herrera', especialidad: 'Fisioterapeuta', auth0Id: 'auth0|medico_ricardo', email: 'ricardo@clinica.com' },
    { nombre: 'Dra. Sofía Villalba', especialidad: 'Médico/Terapista', auth0Id: 'auth0|medico_sofia', email: 'sofia@clinica.com' },
    { nombre: 'Lic. Mariana Torres', especialidad: 'Fisioterapeuta', auth0Id: 'auth0|medico_mariana', email: 'mariana@clinica.com' },
    { nombre: 'Dr. Andrés Ríos', especialidad: 'Quiropráctico', auth0Id: 'auth0|medico_andres', email: 'andres@clinica.com' },
    { nombre: 'Médico General', especialidad: 'Médico/Terapista', auth0Id: 'auth0|medico_default', email: 'medico@gmail.com' },
  ];

  for (const m of medicos) {
    await prisma.medico.upsert({ where: { auth0Id: m.auth0Id }, update: m, create: m });
    console.log(`✅ Médico: ${m.nombre}`);
  }

  // Configuraciones de horario
  const medicosLista = await prisma.medico.findMany();
  const configs = [
    { nombre: 'Dra. Carolina Méndez', dias: 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES', inicio: '08:00', fin: '17:00', intervalo: 30 },
    { nombre: 'Dr. Ricardo Herrera', dias: 'LUNES,MIERCOLES,VIERNES', inicio: '09:00', fin: '15:00', intervalo: 30 },
    { nombre: 'Dra. Sofía Villalba', dias: 'MARTES,JUEVES', inicio: '10:00', fin: '18:00', intervalo: 30 },
    { nombre: 'Lic. Mariana Torres', dias: 'LUNES,MIERCOLES,VIERNES', inicio: '08:00', fin: '20:00', intervalo: 30 },
    { nombre: 'Dr. Andrés Ríos', dias: 'LUNES,MARTES,MIERCOLES,JUEVES', inicio: '07:00', fin: '13:00', intervalo: 30 },
    { nombre: 'Médico General', dias: 'LUNES,MIERCOLES,VIERNES', inicio: '08:00', fin: '17:00', intervalo: 30 },
  ];

  for (const config of configs) {
    const medico = medicosLista.find(m => m.nombre === config.nombre);
    if (medico) {
      await prisma.configuracionMedico.upsert({
        where: { medicoId: medico.id },
        update: { diasAtencion: config.dias, horaInicio: config.inicio, horaFin: config.fin, intervaloMinutos: config.intervalo },
        create: { medicoId: medico.id, diasAtencion: config.dias, horaInicio: config.inicio, horaFin: config.fin, intervaloMinutos: config.intervalo }
      });
      console.log(`✅ Horario para: ${medico.nombre}`);
    }
  }

  // Citas de ejemplo
  const paciente = await prisma.paciente.findFirst();
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 3);
  const fechaStr = fecha.toISOString().split('T')[0];

  for (const medico of medicosLista.slice(0, 3)) {
    await prisma.cita.upsert({
      where: { id: -1 },
      update: {},
      create: {
        fecha: fechaStr,
        hora: '10:00',
        pacienteId: paciente.id,
        medicoId: medico.id,
        estado: 'AGENDADA',
        codigoVerificacion: `CITA-${medico.id}-${Date.now()}`,
        descripcion: `Cita de ejemplo con ${medico.nombre}`
      }
    });
    console.log(`✅ Cita con: ${medico.nombre}`);
  }

  // Configuración global
  await prisma.configuracionGlobal.upsert({
    where: { id: 1 },
    update: { ventanaSemanas: 4 },
    create: { ventanaSemanas: 4 }
  });

  console.log('✅ Seed completado');
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());