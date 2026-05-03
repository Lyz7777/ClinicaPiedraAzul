import { getAuthHeaders } from "../../auth/authService";

const URL = "http://localhost:3000/citas";

const getHeaders = async (withBody = false) => {
  const authHeaders = await getAuthHeaders();
  return withBody ? { "Content-Type": "application/json", ...authHeaders } : { ...authHeaders };
};

// Obtener todas las citas
export const getCitas = async () => {
  const res = await fetch(URL, { headers: await getHeaders() });
  return res.json();
};

// Obtener citas por médico y fecha (Requisito 1)
export const getCitasByMedicoAndFecha = async (medicoId: number, fecha: string) => {
  const res = await fetch(`${URL}?medicoId=${medicoId}&fecha=${fecha}`, { headers: await getHeaders() });
  return res.json();
};

// Crear nueva cita (Requisito 2)
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
      // Sin cuerpo JSON de error, se conserva mensaje genérico.
    }
    throw new Error(mensaje);
  }

  return res.json();
};

// Obtener horas disponibles para un médico en una fecha (Requisito 2)
export const getHorasDisponibles = async (medicoId: number, fecha: string) => {
  const res = await fetch(`${URL}/horas-disponibles?medicoId=${medicoId}&fecha=${fecha}`, { headers: await getHeaders() });
  return res.json();
};

// Actualizar estado de una cita
export const updateEstadoCita = async (id: number, estado: string) => {
  const res = await fetch(`${URL}/${id}`, {
    method: "PATCH",
    headers: await getHeaders(true),
    body: JSON.stringify({ estado })
  });
  return res.json();
};

// Eliminar cita
export const eliminarCita = async (id: number) => {
  await fetch(`${URL}/${id}`, { method: "DELETE", headers: await getHeaders() });
};