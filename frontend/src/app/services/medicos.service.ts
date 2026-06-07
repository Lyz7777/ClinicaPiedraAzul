import { getAuthHeaders } from "../../auth/authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL = `${API_URL}/medicos`;

export const getMedicos = async (esAnonimo: boolean = false) => {
  if (esAnonimo) {
    const res = await fetch(`${API_URL}/citas/public/medicos`);
    if (!res.ok) throw new Error("Error al cargar médicos");
    return res.json();
  }
  
  const res = await fetch(URL, { headers: await getAuthHeaders() });
  if (!res.ok) throw new Error("Error al cargar médicos");
  return res.json();
};

export const crearMedico = async (data: { nombre: string; especialidad: string }) => {
  const headers = await getAuthHeaders();
  const res = await fetch(URL, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Error al guardar");
  return res.json();
};

export const actualizarMedico = async (id: number, data: { nombre: string; especialidad: string }) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${URL}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Error al actualizar");
  return res.json();
};

export const eliminarMedico = async (id: number) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${URL}/${id}`, { method: "DELETE", headers });
  if (!res.ok) throw new Error("Error al eliminar");
};

export const getConfiguracionMedico = async (id: number) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${URL}/${id}/configuracion`, { headers });
    if (res.status === 404) return null;
    return res.json();
  } catch { return null; }
};

export const guardarConfiguracionMedico = async (id: number, config: any) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${URL}/${id}/configuracion`, { method: "PUT", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(config) });
  return res.json();
};

export const getConfiguracionGlobal = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/configuracion/global`, { headers });
    if (res.status === 404) return { ventanaSemanas: 4 };
    return res.json();
  } catch { return { ventanaSemanas: 4 }; }
};

export const guardarConfiguracionGlobal = async (ventanaSemanas: number) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/configuracion/global`, { method: "PUT", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify({ ventanaSemanas }) });
  return res.json();
};