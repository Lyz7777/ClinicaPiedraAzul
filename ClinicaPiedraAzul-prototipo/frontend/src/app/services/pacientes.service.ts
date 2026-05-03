import { getAuthHeaders } from "../../auth/authService";

const URL = "http://localhost:3000/pacientes";

const getHeaders = async (withBody = false) => {
  const authHeaders = await getAuthHeaders();
  return withBody ? { "Content-Type": "application/json", ...authHeaders } : { ...authHeaders };
};

// Obtener todos los pacientes
export const getPacientes = async () => {
  const res = await fetch(URL, { headers: await getHeaders() });
  return res.json();
};

// Crear nuevo paciente
export const crearPaciente = async (data: {
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  genero: 'Hombre' | 'Mujer' | 'Otro';
  fechaNacimiento?: string;
  email?: string;
}) => {
  const res = await fetch(URL, {
    method: "POST",
    headers: await getHeaders(true),
    body: JSON.stringify(data)
  });
  return res.json();
};

// Buscar paciente por documento
export const buscarPacientePorDocumento = async (documento: string) => {
  try {
    const res = await fetch(`${URL}/documento/${documento}`, { headers: await getHeaders() });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Error al buscar paciente');
    }
    return res.json();
  } catch (error) {
    console.error('Error buscando paciente:', error);
    return null;
  }
};

// Actualizar paciente
export const actualizarPaciente = async (id: number, data: any) => {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: await getHeaders(true),
    body: JSON.stringify(data)
  });
  return res.json();
};

// Eliminar paciente
export const eliminarPaciente = async (id: number) => {
  await fetch(`${URL}/${id}`, { method: "DELETE", headers: await getHeaders() });
};