import { getAuthHeaders } from "../../auth/authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL = `${API_URL}/pacientes`;

const getHeaders = async (withBody = false) => {
  const authHeaders = await getAuthHeaders();
  return withBody ? { "Content-Type": "application/json", ...authHeaders } : { ...authHeaders };
};

export const getPacientes = async () => {
  const res = await fetch(URL, { headers: await getHeaders() });
  return res.json();
};

export const crearPaciente = async (data: {
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  genero: 'Hombre' | 'Mujer' | 'Otro';
  fechaNacimiento?: string;
  email?: string;
  auth0Id?: string;
}) => {
  const res = await fetch(URL, {
    method: "POST",
    headers: await getHeaders(true),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const buscarPacientePorDocumento = async (documento: string) => {
  try {
    const res = await fetch(`${URL}/documento/${documento}`, { headers: await getHeaders() });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Error al buscar paciente');
    }
    if (res.status === 204) return null;
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Error buscando paciente:', error);
    return null;
  }
};

export const actualizarPaciente = async (id: number, data: {
  nombres?: string;
  apellidos?: string;
  documento?: string;
  celular?: string;
  genero?: 'Hombre' | 'Mujer' | 'Otro';
  fechaNacimiento?: string;
  email?: string;
  auth0Id?: string;
}) => {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: await getHeaders(true),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const eliminarPaciente = async (id: number) => {
  await fetch(`${URL}/${id}`, { method: "DELETE", headers: await getHeaders() });
};