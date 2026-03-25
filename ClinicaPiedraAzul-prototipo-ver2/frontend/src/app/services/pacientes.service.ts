const URL = "http://localhost:3000/pacientes";

// Obtener todos los pacientes
export const getPacientes = async () => {
  const res = await fetch(URL);
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    // Si el paciente ya existe (documento duplicado), intentar buscarlo
    if (res.status === 409 || res.status === 400 || res.status === 500) {
      const existente = await buscarPacientePorDocumento(data.documento);
      if (existente) return existente;
    }
    let mensaje = "Error al registrar paciente";
    try {
      const error = await res.json();
      mensaje = typeof error?.message === "string" ? error.message : mensaje;
    } catch {}
    throw new Error(mensaje);
  }

  return res.json();
};

// Buscar paciente por documento
export const buscarPacientePorDocumento = async (documento: string) => {
  try {
    const res = await fetch(`${URL}/documento/${documento}`);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.trim() === "" || text.trim() === "null") return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch (error) {
    console.error('Error buscando paciente:', error);
    return null;
  }
};

// Actualizar paciente
export const actualizarPaciente = async (id: number, data: any) => {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

// Eliminar paciente
export const eliminarPaciente = async (id: number) => {
  await fetch(`${URL}/${id}`, { method: "DELETE" });
};