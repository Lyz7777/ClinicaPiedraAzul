import { getAuthHeaders } from "../../auth/authService";

const URL = "http://localhost:3000/medicos";

const getHeaders = async (withBody = false) => {
  const authHeaders = await getAuthHeaders();
  return withBody ? { "Content-Type": "application/json", ...authHeaders } : { ...authHeaders };
};

// Obtener todos los médicos
export const getMedicos = async () => {
  const res = await fetch(URL, { headers: await getHeaders() });
  return res.json();
};

// Obtener médico por ID
export const getMedicoById = async (id: number) => {
  const res = await fetch(`${URL}/${id}`, { headers: await getHeaders() });
  return res.json();
};

// Crear nuevo médico
export const crearMedico = async (data: {
  nombre: string;
  especialidad: string;
}) => {
  const res = await fetch(URL, {
    method: "POST",
    headers: await getHeaders(true),
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
    headers: await getHeaders(true),
    body: JSON.stringify(data)
  });
  return res.json();
};

// Eliminar médico
export const eliminarMedico = async (id: number) => {
  await fetch(`${URL}/${id}`, { method: "DELETE", headers: await getHeaders() });
};

// Obtener configuración de un médico
export const getConfiguracionMedico = async (id: number) => {
  try {
    const res = await fetch(`${URL}/${id}/configuracion`, { headers: await getHeaders() });
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
    headers: await getHeaders(true),
    body: JSON.stringify(config)
  });
  return res.json();
};

// Guardar configuración global
export const guardarConfiguracionGlobal = async (ventanaSemanas: number) => {
  const res = await fetch("http://localhost:3000/configuracion/global", {
    method: "PUT",
    headers: await getHeaders(true),
    body: JSON.stringify({ ventanaSemanas })
  });
  return res.json();
};

// Obtener configuración global
export const getConfiguracionGlobal = async () => {
  try {
    const res = await fetch("http://localhost:3000/configuracion/global", { headers: await getHeaders() });
    if (res.status === 404) return { ventanaSemanas: 4 };
    return res.json();
  } catch {
    return { ventanaSemanas: 4 };
  }
};