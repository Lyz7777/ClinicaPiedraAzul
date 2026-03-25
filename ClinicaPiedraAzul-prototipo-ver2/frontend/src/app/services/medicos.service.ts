const URL = "http://localhost:3000/medicos";

// Obtener todos los médicos
export const getMedicos = async () => {
  const res = await fetch(URL);
  return res.json();
};

// Obtener médico por ID
export const getMedicoById = async (id: number) => {
  const res = await fetch(`${URL}/${id}`);
  return res.json();
};

// Crear nuevo médico
export const crearMedico = async (data: {
  nombre: string;
  especialidad: string;
}) => {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

// Actualizar médico
export const actualizarMedico = async (id: number, data: {
  nombre: string;
  especialidad: string;
}) => {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

// Eliminar médico
export const eliminarMedico = async (id: number) => {
  await fetch(`${URL}/${id}`, { method: "DELETE" });
};

// Obtener configuración de un médico
export const getConfiguracionMedico = async (id: number) => {
  try {
    const res = await fetch(`${URL}/${id}/configuracion`);
    if (res.status === 404) return null;
    return res.json();
  } catch {
    return null;
  }
};

// Guardar configuración de un médico
export const guardarConfiguracionMedico = async (id: number, config: {
  diasAtencion: string[];
  horaInicio: string;
  horaFin: string;
  intervaloMinutos: number;
}) => {
  const res = await fetch(`${URL}/${id}/configuracion`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config)
  });
  return res.json();
};

// Guardar configuración global
export const guardarConfiguracionGlobal = async (ventanaSemanas: number) => {
  const res = await fetch("http://localhost:3000/configuracion/global", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ventanaSemanas })
  });
  return res.json();
};

// Obtener configuración global
export const getConfiguracionGlobal = async () => {
  try {
    const res = await fetch("http://localhost:3000/configuracion/global");
    if (res.status === 404) return { ventanaSemanas: 4 };
    return res.json();
  } catch {
    return { ventanaSemanas: 4 };
  }
};