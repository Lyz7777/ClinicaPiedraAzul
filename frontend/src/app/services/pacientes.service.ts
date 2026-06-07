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
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al crear paciente");
  }
  return res.json();
};

export const buscarPacientePorDocumento = async (documento: string) => {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${URL}/documento/${documento}`, {
      headers: authHeaders
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.error("Error en búsqueda:", res.status);
      return null;
    }

    const data = await res.json();
    if (data && data.id && data.nombres && !data.nombres.startsWith('auth0_')) {
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error buscando paciente:', error);
    return null;
  }
};

export const actualizarPaciente = async (id: number, data: any) => {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: await getHeaders(true),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar");
  return res.json();
};

export const eliminarPaciente = async (id: number) => {
  await fetch(`${URL}/${id}`, {
    method: "DELETE",
    headers: await getHeaders()
  });
};