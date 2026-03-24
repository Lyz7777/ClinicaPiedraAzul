const URL = "http://localhost:3000/citas";

// Obtener todas las citas
export const getCitas = async () => {
  const res = await fetch(URL);
  return res.json();
};

// Obtener citas por médico y fecha (Requisito 1)
export const getCitasByMedicoAndFecha = async (medicoId: number, fecha: string) => {
  const res = await fetch(`${URL}?medicoId=${medicoId}&fecha=${fecha}`);
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

// Obtener horas disponibles para un médico en una fecha (Requisito 2)
export const getHorasDisponibles = async (medicoId: number, fecha: string) => {
  const res = await fetch(`${URL}/horas-disponibles?medicoId=${medicoId}&fecha=${fecha}`);
  return res.json();
};

// Actualizar estado de una cita
export const updateEstadoCita = async (id: number, estado: string) => {
  const res = await fetch(`${URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado })
  });
  return res.json();
};

// Eliminar cita
export const eliminarCita = async (id: number) => {
  await fetch(`${URL}/${id}`, { method: "DELETE" });
};