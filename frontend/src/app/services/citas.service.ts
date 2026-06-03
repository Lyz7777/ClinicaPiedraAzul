import { getAuthHeaders } from "../../auth/authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL = `${API_URL}/citas`;

const getHeaders = async (withBody = false) => {
  const authHeaders = await getAuthHeaders();
  return withBody ? { "Content-Type": "application/json", ...authHeaders } : { ...authHeaders };
};

// ==================== OBTENER CITAS ====================

export const getCitas = async (params?: {
  medicoId?: number;
  fecha?: string;
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
}) => {
  const search = new URLSearchParams();
  if (params?.medicoId) search.set("medicoId", String(params.medicoId));
  if (params?.fecha) search.set("fecha", params.fecha);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.order) search.set("order", params.order);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const res = await fetch(`${URL}${suffix}`, { headers: await getHeaders() });
  if (!res.ok) throw new Error("Error al cargar citas");
  return res.json();
};

export const getMisCitas = async (fecha?: string) => {
  const params = fecha ? `?fecha=${fecha}` : "";
  const res = await fetch(`${URL}/mis-citas${params}`, { headers: await getHeaders() });
  if (!res.ok) throw new Error("Error al cargar mis citas");
  return res.json();
};

// ==================== HORAS DISPONIBLES ====================

export const getHorasDisponibles = async (medicoId: number, fecha: string) => {
  const res = await fetch(`${URL}/horas-disponibles?medicoId=${medicoId}&fecha=${fecha}`, { 
    headers: await getHeaders() 
  });
  if (!res.ok) return [];
  return res.json();
};

// ==================== CREAR CITAS ====================

export const crearCita = async (data: {
  fecha: string;
  hora: string;
  pacienteId: number;
  medicoId: number;
  descripcion?: string;
  estado?: string;
}) => {
  const res = await fetch(URL, {
    method: "POST",
    headers: await getHeaders(true),
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    let mensaje = "No fue posible agendar la cita";
    try {
      const error = await res.json();
      if (typeof error?.message === "string") {
        mensaje = error.message;
      } else if (Array.isArray(error?.message)) {
        mensaje = error.message.join(". ");
      }
    } catch {
      // Sin cuerpo JSON de error
    }
    throw new Error(mensaje);
  }

  return res.json();
};

export const crearCitaPaciente = async (data: {
  fecha: string;
  hora: string;
  pacienteId: number;
  medicoId: number;
  descripcion?: string;
  estado?: string;
}) => {
  const res = await fetch(`${URL}/agendar`, {
    method: "POST",
    headers: await getHeaders(true),
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    let mensaje = "No fue posible agendar la cita";
    try {
      const error = await res.json();
      if (typeof error?.message === "string") {
        mensaje = error.message;
      }
    } catch {
      // Sin cuerpo JSON
    }
    throw new Error(mensaje);
  }

  return res.json();
};

// ==================== REAGENDAR CITAS ====================

export const reagendarCita = async (id: number, fecha: string, hora: string) => {
  const res = await fetch(`${URL}/${id}/reagendar`, {
    method: "PUT",
    headers: await getHeaders(true),
    body: JSON.stringify({ fecha, hora })
  });

  if (!res.ok) {
    let mensaje = "No fue posible reagendar la cita";
    try {
      const error = await res.json();
      mensaje = error.message || mensaje;
    } catch {
      mensaje = "Error de conexión al reagendar";
    }
    throw new Error(mensaje);
  }

  return res.json();
};

// ==================== EXPORTAR CSV ====================

export const exportarCitasCSV = async (medicoId?: number, fecha?: string) => {
  const params = new URLSearchParams();
  if (medicoId) params.set("medicoId", String(medicoId));
  if (fecha) params.set("fecha", fecha);
  
  const res = await fetch(`${URL}/exportar-csv?${params}`, { headers: await getHeaders() });
  
  if (!res.ok) {
    throw new Error("Error al exportar");
  }
  
  return res.blob();
};

// ==================== HISTORIAL ====================

export const getHistorialCita = async (id: number) => {
  const res = await fetch(`${URL}/${id}/historial`, { headers: await getHeaders() });
  if (!res.ok) throw new Error("Error al cargar historial");
  return res.json();
};

// ==================== ELIMINAR ====================

export const eliminarCita = async (id: number) => {
  const res = await fetch(`${URL}/${id}`, { method: "DELETE", headers: await getHeaders() });
  if (!res.ok) throw new Error("Error al eliminar cita");
};

export const updateEstadoCita = async (id: number, estado: string) => {
  const res = await fetch(`${URL}/${id}`, {
    method: "PATCH",
    headers: await getHeaders(true),
    body: JSON.stringify({ estado })
  });
  if (!res.ok) throw new Error("Error al actualizar estado");
  return res.json();
};

// ==================== MARCAR ASISTENCIA ====================

export const marcarAsistencia = async (id: number, asistio: boolean, metodo?: string) => {
  const res = await fetch(`${URL}/${id}/asistencia`, {
    method: "PATCH",
    headers: await getHeaders(true),
    body: JSON.stringify({ asistio, metodo: metodo || 'MANUAL' })
  });
  if (!res.ok) throw new Error("Error al marcar asistencia");
  return res.json();
};