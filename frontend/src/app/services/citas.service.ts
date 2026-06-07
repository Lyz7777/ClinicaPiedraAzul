import { getAuthHeaders } from "../../auth/authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL = `${API_URL}/citas`;

const getHeaders = async (withBody = false) => {
  const authHeaders = await getAuthHeaders();
  return withBody ? { "Content-Type": "application/json", ...authHeaders } : { ...authHeaders };
};

export const getCitas = async (params?: { medicoId?: number; fecha?: string; page?: number; limit?: number; order?: "asc" | "desc" }) => {
  const search = new URLSearchParams();
  if (params?.medicoId) search.set("medicoId", String(params.medicoId));
  if (params?.fecha) search.set("fecha", params.fecha);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.order) search.set("order", params.order);
  const res = await fetch(`${URL}${search.toString() ? `?${search}` : ""}`, { headers: await getHeaders() });
  if (!res.ok) throw new Error("Error al cargar citas");
  return res.json();
};

export const getMisCitas = async (fecha?: string) => {
  const res = await fetch(`${URL}/mis-citas${fecha ? `?fecha=${fecha}` : ""}`, { headers: await getHeaders() });
  if (!res.ok) throw new Error("Error al cargar mis citas");
  return res.json();
};

export const getHorasDisponibles = async (medicoId: number, fecha: string, esAnonimo: boolean = false) => {
  if (esAnonimo) {
    const res = await fetch(`${API_URL}/citas/public/horas-disponibles?medicoId=${medicoId}&fecha=${fecha}`);
    if (!res.ok) return [];
    return res.json();
  }
  
  const res = await fetch(`${URL}/horas-disponibles?medicoId=${medicoId}&fecha=${fecha}`, { headers: await getHeaders() });
  if (!res.ok) return [];
  return res.json();
};

export const crearCita = async (data: { fecha: string; hora: string; pacienteId: number; medicoId: number; descripcion?: string; estado?: string }) => {
  const res = await fetch(URL, { method: "POST", headers: await getHeaders(true), body: JSON.stringify(data) });
  if (!res.ok) throw new Error("No fue posible agendar la cita");
  return res.json();
};

export const crearCitaPaciente = async (data: { fecha: string; hora: string; pacienteId: number; medicoId: number; descripcion?: string; estado?: string }, esAnonimo: boolean = false) => {
  if (esAnonimo) {
    const res = await fetch(`${API_URL}/citas/public/agendar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("No fue posible agendar la cita");
    return res.json();
  }
  
  const res = await fetch(`${URL}/agendar`, {
    method: "POST",
    headers: await getHeaders(true),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("No fue posible agendar la cita");
  return res.json();
};

export const reagendarCita = async (id: number, fecha: string, hora: string) => {
  const res = await fetch(`${URL}/${id}/reagendar`, { method: "PUT", headers: await getHeaders(true), body: JSON.stringify({ fecha, hora }) });
  if (!res.ok) throw new Error("No fue posible reagendar");
  return res.json();
};

export const exportarCitasCSV = async (medicoId?: number, fecha?: string) => {
  const params = new URLSearchParams();
  if (medicoId) params.set("medicoId", String(medicoId));
  if (fecha) params.set("fecha", fecha);
  const res = await fetch(`${URL}/exportar-csv?${params}`, { headers: await getHeaders() });
  if (!res.ok) throw new Error("Error al exportar");
  return res.blob();
};

export const getHistorialCita = async (id: number) => {
  const res = await fetch(`${URL}/${id}/historial`, { headers: await getHeaders() });
  if (!res.ok) throw new Error("Error al cargar historial");
  return res.json();
};

export const eliminarCita = async (id: number) => {
  const res = await fetch(`${URL}/${id}`, { method: "DELETE", headers: await getHeaders() });
  if (!res.ok) throw new Error("Error al eliminar");
};

export const updateEstadoCita = async (id: number, estado: string) => {
  const res = await fetch(`${URL}/${id}`, { method: "PATCH", headers: await getHeaders(true), body: JSON.stringify({ estado }) });
  if (!res.ok) throw new Error("Error al actualizar");
  return res.json();
};

export const marcarAsistencia = async (id: number, asistio: boolean, metodo?: string) => {
  const res = await fetch(`${URL}/${id}/asistencia`, { method: "PATCH", headers: await getHeaders(true), body: JSON.stringify({ asistio, metodo: metodo || 'MANUAL' }) });
  if (!res.ok) throw new Error("Error al marcar asistencia");
  return res.json();
};

export const actualizarNotasMedicas = async (id: number, notasMedicas: string) => {
  const res = await fetch(`${URL}/${id}/notas`, { method: "PATCH", headers: await getHeaders(true), body: JSON.stringify({ notasMedicas }) });
  if (!res.ok) throw new Error("Error al guardar notas");
  return res.json();
};

export const agregarNota = async (citaId: number, contenido: string) => {
  const res = await fetch(`${URL}/${citaId}/notas`, {
    method: "POST",
    headers: await getHeaders(true),
    body: JSON.stringify({ contenido })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al agregar nota");
  }
  return res.json();
};

export const obtenerNotas = async (citaId: number) => {
  const res = await fetch(`${URL}/${citaId}/notas`, {
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error("Error al obtener notas");
  return res.json();
};

// ✅ NUEVA FUNCIÓN: Obtener notas públicas (para pacientes anónimos)
export const obtenerNotasPublic = async (citaId: number) => {
  const res = await fetch(`${API_URL}/citas/public/notas/${citaId}`);
  if (!res.ok) throw new Error("Error al obtener notas");
  return res.json();
};

export const buscarCitasPorDocumentoPublic = async (documento: string) => {
  const res = await fetch(`${API_URL}/citas/public/por-documento/${documento}?todas=true`);
  if (!res.ok) return null;
  return res.json();
};