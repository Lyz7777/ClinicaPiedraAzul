const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // ==================== USUARIOS BASE ====================
  const usuarios = [
    {
      auth0Id: 'auth0|admin_default',
      username: 'administrador',
      email: 'admin@gmail.com.com',
      nombre: 'Administrador del Sistema',
      role: 'admin'
    },
    {
      auth0Id: 'auth0|agendador_default',
      username: 'agendador',
      email: 'agendador@gmail.com',
      nombre: 'Agendador de Citas',
      role: 'agendador'
    },
    {
      auth0Id: 'auth0|paciente_default',
      username: 'paciente',
      email: 'paciente@gmail.com',
      nombre: 'Paciente de Prueba',
      role: 'paciente'
    },
    {
      auth0Id: 'auth0|medico_default',
      username: 'medico',
      email: 'medico@gmail.com',
      nombre: 'Médico de Prueba',
      role: 'medico'
    },
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { username: usuario.username },
      update: usuario,
      create: usuario,
    });
    console.log(`✅ Usuario ${usuario.username} (${usuario.role})`);
  }

  // ==================== PACIENTE DE EJEMPLO ====================
  const pacienteData = {
    documento: '1002964972',
    nombres: 'Laura',
    apellidos: 'Mera',
    celular: '3004336562',
    genero: 'Mujer',
    fechaNacimiento: '1995-06-15',
    email: 'laura.mera@email.com',
    auth0Id: 'auth0|paciente_default'
  };

  await prisma.paciente.upsert({
    where: { documento: '1002964972' },
    update: pacienteData,
    create: pacienteData,
  });
  console.log(`✅ Paciente: ${pacienteData.nombres} ${pacienteData.apellidos}`);

  // ==================== MÉDICOS DE EJEMPLO ====================
  const medicosData = [
    { nombre: 'Dra. Carolina Méndez', especialidad: 'Medicina General', auth0Id: 'auth0|medico_general' },
    { nombre: 'Dr. Ricardo Herrera', especialidad: 'Cardiología', auth0Id: 'auth0|medico_cardio' },
    { nombre: 'Dra. Sofía Villalba', especialidad: 'Dermatología', auth0Id: 'auth0|medico_derma' },
    { nombre: 'Lic. Mariana Torres', especialidad: 'Psicología', auth0Id: 'auth0|medico_psico' },
    { nombre: 'Dr. Andrés Ríos', especialidad: 'Traumatología', auth0Id: 'auth0|medico_trauma' },
  ];

  for (const m of medicosData) {
    const existente = await prisma.medico.findUnique({
      where: { auth0Id: m.auth0Id }
    });
    
    if (!existente) {
      await prisma.medico.create({ data: m });
      console.log(`✅ Médico creado: ${m.nombre}`);
    } else {
      console.log(`⏭️ Médico ya existe: ${m.nombre}`);
    }
  }

  // ==================== CONFIGURACIONES DE HORARIO ====================
  const medicos = await prisma.medico.findMany();
  
  const configs = [
    { medicoAuth0Id: 'auth0|medico_general', dias: 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES', inicio: '08:00', fin: '17:00', intervalo: 30 },
    { medicoAuth0Id: 'auth0|medico_cardio', dias: 'LUNES,MIERCOLES,VIERNES', inicio: '09:00', fin: '15:00', intervalo: 30 },
    { medicoAuth0Id: 'auth0|medico_derma', dias: 'MARTES,JUEVES', inicio: '10:00', fin: '18:00', intervalo: 30 },
    { medicoAuth0Id: 'auth0|medico_psico', dias: 'LUNES,MIERCOLES,VIERNES', inicio: '08:00', fin: '20:00', intervalo: 30 },
    { medicoAuth0Id: 'auth0|medico_trauma', dias: 'LUNES,MARTES,MIERCOLES,JUEVES', inicio: '07:00', fin: '13:00', intervalo: 30 },
  ];

  for (const config of configs) {
    const medico = medicos.find(m => m.auth0Id === config.medicoAuth0Id);
    if (medico) {
      const existente = await prisma.configuracionMedico.findUnique({
        where: { medicoId: medico.id }
      });
      
      if (!existente) {
        await prisma.configuracionMedico.create({
          data: {
            medicoId: medico.id,
            diasAtencion: config.dias,
            horaInicio: config.inicio,
            horaFin: config.fin,
            intervaloMinutos: config.intervalo,
          },
        });
        console.log(`✅ Horario configurado para: ${medico.nombre}`);
      }
    }
  }

  // ==================== CONFIGURACIÓN GLOBAL ====================
  const configGlobal = await prisma.configuracionGlobal.findFirst();
  if (!configGlobal) {
    await prisma.configuracionGlobal.create({
      data: { ventanaSemanas: 4 }
    });
    console.log(` Configuración global creada`);
  }

  console.log(' Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error(' Error en seed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });