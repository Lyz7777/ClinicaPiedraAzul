import { useEffect, useState } from "react";
import { getHorasDisponibles } from "../services/citas.service";
import { getAuthHeaders } from "../../auth/authService";
import { Button, Card, Modal, Spinner, useToast } from "../../components/UI";
import { Search, UserRound, Calendar, Clock, Stethoscope } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL_CITAS = `${API_URL}/citas`;

interface MisCitasProps {
  rol?: "admin" | "agendador" | "medico" | "paciente";
}

function MisCitas({ rol = "paciente" }: MisCitasProps) {
  const toast = useToast();

  // Búsqueda por documento (solo paciente)
  const [documentoBusqueda, setDocumentoBusqueda] = useState("");
  const [documentoIngresado, setDocumentoIngresado] = useState("");
  const [datosPaciente, setDatosPaciente] = useState<any>(null);
  const [buscando, setBuscando] = useState(false);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(rol === "paciente");

  // Citas
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState("");

  // Reagendar
  const [citaSeleccionada, setCitaSeleccionada] = useState<any>(null);
  const [mostrarModalReagendar, setMostrarModalReagendar] = useState(false);
  const [nuevaFechaReag, setNuevaFechaReag] = useState("");
  const [nuevaHoraReag, setNuevaHoraReag] = useState("");
  const [cargandoReagendar, setCargandoReagendar] = useState(false);
  const [horasDisponiblesReag, setHorasDisponiblesReag] = useState<string[]>([]);
  const [cargandoHorasReag, setCargandoHorasReag] = useState(false);
  const [errFechaReag, setErrFechaReag] = useState("");
  const [errHoraReag, setErrHoraReag] = useState("");

  // Historial
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const normalizeList = (data: any) => Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  // Cargar citas para médico
  const cargarCitasMedico = async () => {
    setCargando(true);
    try {
      const authHeaders = await getAuthHeaders();
      const params = filtroFecha ? `?fecha=${filtroFecha}` : "";
      const res = await fetch(`${URL_CITAS}/mis-citas${params}`, { headers: authHeaders });
      if (!res.ok) throw new Error("Error al cargar citas");
      const data = await res.json();
      setCitas(normalizeList(data));
    } catch (err: any) {
      toast.error("Error al cargar citas", err?.message);
      setCitas([]);
    } finally {
      setCargando(false);
    }
  };

  // Buscar citas por documento (paciente)
  const buscarCitasPorDocumento = async () => {
    if (!documentoBusqueda.trim()) {
      toast.error("Ingrese un número de documento");
      return;
    }
    setBuscando(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/por-documento/${documentoBusqueda.trim()}`, { headers: authHeaders });
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("No se encontró un paciente con ese documento");
          setCitas([]);
          setDatosPaciente(null);
          return;
        }
        throw new Error("Error al buscar citas");
      }
      const data = await res.json();
      setCitas(normalizeList(data.data || data));
      setDatosPaciente(data.paciente || null);
      setDocumentoIngresado(documentoBusqueda.trim());
      setMostrarBusqueda(false);
    } catch (err: any) {
      toast.error("Error al buscar citas", err?.message);
      setCitas([]);
      setDatosPaciente(null);
    } finally {
      setBuscando(false);
    }
  };

  // Cargar según rol
  useEffect(() => {
    if (rol === "medico") {
      cargarCitasMedico();
    }
  }, [rol, filtroFecha]);

  // Horas disponibles para reagendar
  useEffect(() => {
    if (!citaSeleccionada || !nuevaFechaReag) {
      setHorasDisponiblesReag([]);
      return;
    }
    setCargandoHorasReag(true);
    getHorasDisponibles(citaSeleccionada.medicoId, nuevaFechaReag)
      .then(h => {
        if (Array.isArray(h)) setHorasDisponiblesReag(h);
        else if (h?.horas) setHorasDisponiblesReag(h.horas);
        else if (h?.data) setHorasDisponiblesReag(h.data);
        else setHorasDisponiblesReag([]);
      })
      .catch(() => setHorasDisponiblesReag([]))
      .finally(() => setCargandoHorasReag(false));
  }, [citaSeleccionada, nuevaFechaReag]);

  const abrirModalReagendar = (cita: any) => {
    setCitaSeleccionada(cita);
    setNuevaFechaReag(cita.fecha);
    setNuevaHoraReag(cita.hora);
    setErrFechaReag("");
    setErrHoraReag("");
    setMostrarModalReagendar(true);
  };

  const reagendarCita = async () => {
    let ok = true;
    if (!nuevaFechaReag) { setErrFechaReag("Seleccione una fecha"); ok = false; } else setErrFechaReag("");
    if (!nuevaHoraReag) { setErrHoraReag("Seleccione una hora"); ok = false; } else setErrHoraReag("");
    if (!ok) return;

    setCargandoReagendar(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaSeleccionada.id}/reagendar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ fecha: nuevaFechaReag, hora: nuevaHoraReag }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || "Error al reagendar");
      }
      toast.success("Cita reagendada exitosamente");
      setMostrarModalReagendar(false);
      if (rol === "medico") cargarCitasMedico();
      else buscarCitasPorDocumento();
    } catch (err: any) {
      toast.error("Error al reagendar", err.message);
    } finally {
      setCargandoReagendar(false);
    }
  };

  const verHistorial = async (citaId: number) => {
    setMostrarModalHistorial(true);
    setCargandoHistorial(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaId}/historial`, { headers: authHeaders });
      if (!res.ok) throw new Error();
      setHistorial(await res.json());
    } catch {
      toast.error("Error al cargar historial");
      setHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const volverABuscar = () => {
    setMostrarBusqueda(true);
    setDocumentoBusqueda("");
    setDocumentoIngresado("");
    setCitas([]);
    setDatosPaciente(null);
  };

  // Pantalla de búsqueda para paciente
  if (mostrarBusqueda && rol === "paciente") {
    return (
      <div>
        <div className="page-header">
          <h2>📋 Mis Citas</h2>
          <p>Ingresa tu número de documento para consultar tus citas</p>
        </div>
        <Card variant="elevated">
          <div style={{ maxWidth: 450, margin: "0 auto", textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 80, height: 80, background: "var(--primary-50)",
              borderRadius: "50%", display: "inline-flex",
              alignItems: "center", justifyContent: "center", marginBottom: 20,
            }}>
              <UserRound size={40} color="var(--primary-500)" />
            </div>
            <h3>Consulta tus citas</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
              Ingresa tu número de documento de identidad
            </p>
            <div style={{ marginBottom: 16 }}>
              <input
                className="input-field"
                placeholder="Ej: 1002964972"
                value={documentoBusqueda}
                onChange={(e) => setDocumentoBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarCitasPorDocumento()}
                style={{ textAlign: "center", fontSize: "1.1rem" }}
              />
            </div>
            <Button variant="primary" fullWidth onClick={buscarCitasPorDocumento} loading={buscando}>
              <Search size={18} /> Buscar mis citas
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>{rol === "medico" ? "🩺 Mi Agenda de Citas" : "📋 Mis Citas"}</h2>
        <p>
          {rol === "medico"
            ? "Aquí encuentras todas las citas agendadas con tus pacientes"
            : datosPaciente
              ? <>Paciente: <strong>{datosPaciente.nombres} {datosPaciente.apellidos}</strong> · Doc: <strong>{datosPaciente.documento}</strong></>
              : "Tus citas agendadas"}
        </p>
      </div>

      {/* Filtro por fecha */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="date-input"
        />
        <Button variant="primary" size="sm" onClick={() => rol === "medico" ? cargarCitasMedico() : buscarCitasPorDocumento()}>
          🔍 Filtrar
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setFiltroFecha("")}>
          🗑️ Limpiar
        </Button>
        {rol === "paciente" && (
          <Button variant="secondary" size="sm" onClick={volverABuscar}>
            🔍 Buscar otro paciente
          </Button>
        )}
      </div>

      // En MisCitas.tsx, después de la sección de filtro por fecha, agrega este botón:

{/* Botón de exportar CSV para médico */}
{rol === "medico" && (
  <Button 
    variant="secondary" 
    size="sm" 
    onClick={async () => {
      setCargando(true);
      try {
        const authHeaders = await getAuthHeaders();
        const params = filtroFecha ? `?fecha=${filtroFecha}` : "";
        const res = await fetch(`${URL_CITAS}/exportar-csv${params}`, { headers: authHeaders });
        if (!res.ok) throw new Error("Error al exportar");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mis-citas${filtroFecha ? "_" + filtroFecha : ""}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("CSV exportado correctamente");
      } catch (err: any) {
        toast.error("Error al exportar", err.message);
      } finally {
        setCargando(false);
      }
    }}
  >
    📥 Exportar mis citas
  </Button>
)}

      {/* Tabla de citas */}
      <Card variant="elevated">
        {cargando ? (
          <Spinner text="Cargando citas..." />
        ) : citas.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} style={{ marginBottom: 16, color: "var(--text-muted)" }} />
            <p>No hay citas para mostrar</p>
            <small>{rol === "medico" ? "No tienes citas agendadas para esta fecha" : "No se encontraron citas"}</small>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 12 }}>
              {citas.length} cita(s) encontrada(s)
            </p>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th><Calendar size={14} style={{ marginRight: 4 }} />Fecha</th>
                    <th><Clock size={14} style={{ marginRight: 4 }} />Hora</th>
                    {rol === "medico" && <th><UserRound size={14} style={{ marginRight: 4 }} />Paciente</th>}
                    {rol === "medico" && <th>Documento</th>}
                    {rol === "medico" && <th>Celular</th>}
                    {(rol === "paciente" || rol === "admin" || rol === "agendador") && (
                      <th><Stethoscope size={14} style={{ marginRight: 4 }} />Médico</th>
                    )}
                    {(rol === "paciente" || rol === "admin" || rol === "agendador") && <th>Especialidad</th>}
                    <th>Estado</th>
                    <th>Motivo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map(cita => (
                    <tr key={cita.id}>
                      <td><strong>{cita.fecha}</strong></td>
                      <td>{cita.hora}</td>
                      {rol === "medico" && (
                        <>
                          <td><strong>{cita.paciente?.nombres} {cita.paciente?.apellidos}</strong></td>
                          <td>{cita.paciente?.documento || "—"}</td>
                          <td>{cita.paciente?.celular || "—"}</td>
                        </>
                      )}
                      {(rol === "paciente" || rol === "admin" || rol === "agendador") && (
                        <>
                          <td>{cita.medico?.nombre || "—"}</td>
                          <td>{cita.medico?.especialidad || "—"}</td>
                        </>
                      )}
                      <td>
                        <span className={`badge ${
                          cita.estado === "AGENDADA" ? "badge-warning" :
                          cita.estado === "CANCELADA" ? "badge-danger" :
                          cita.estado === "COMPLETADA" ? "badge-success" :
                          "badge-info"
                        }`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {cita.descripcion || "—"}
                      </td>
                      <td className="actions-cell">
                        <Button variant="secondary" size="sm" onClick={() => abrirModalReagendar(cita)}>
                          🔄
                        </Button>
                        <Button variant="info" size="sm" onClick={() => verHistorial(cita.id)}>
                          📜
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Modal Reagendar */}
      <Modal isOpen={mostrarModalReagendar} onClose={() => setMostrarModalReagendar(false)} title="🔄 Reagendar Cita">
        <div style={{ background: "var(--primary-50)", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <p><strong>📅 Fecha actual:</strong> {citaSeleccionada?.fecha} a las {citaSeleccionada?.hora}</p>
          {citaSeleccionada?.paciente && <p><strong>👤 Paciente:</strong> {citaSeleccionada.paciente.nombres} {citaSeleccionada.paciente.apellidos}</p>}
          {citaSeleccionada?.medico && <p><strong>👨‍⚕️ Médico:</strong> {citaSeleccionada.medico.nombre}</p>}
        </div>
        <div className={`form-group ${errFechaReag ? "input-error" : ""}`}>
          <label className="input-label">Nueva fecha <span className="input-required">*</span></label>
          <input type="date" value={nuevaFechaReag} min={new Date().toISOString().split("T")[0]}
            onChange={e => { setNuevaFechaReag(e.target.value); setErrFechaReag(""); }} className="input-field" />
          {errFechaReag && <span className="input-error-message">{errFechaReag}</span>}
        </div>
        <div className={`form-group ${errHoraReag ? "input-error" : ""}`}>
          <label className="input-label">Nueva hora <span className="input-required">*</span></label>
          <select value={nuevaHoraReag} onChange={e => { setNuevaHoraReag(e.target.value); setErrHoraReag(""); }}
            disabled={cargandoHorasReag} className="input-field">
            <option value="">Seleccione hora</option>
            {Array.isArray(horasDisponiblesReag) && horasDisponiblesReag.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          {cargandoHorasReag && <span className="input-helper">Cargando horarios...</span>}
          {errHoraReag && <span className="input-error-message">{errHoraReag}</span>}
        </div>
        <div className="modal-buttons">
          <Button variant="primary" onClick={reagendarCita} loading={cargandoReagendar}>Guardar cambios</Button>
          <Button variant="secondary" onClick={() => setMostrarModalReagendar(false)}>Cancelar</Button>
        </div>
      </Modal>

      {/* Modal Historial */}
      <Modal isOpen={mostrarModalHistorial} onClose={() => setMostrarModalHistorial(false)} title="📜 Historial de cambios" size="lg">
        {cargandoHistorial ? <Spinner text="Cargando historial..." /> : historial.length === 0 ? (
          <p>No hay cambios registrados para esta cita.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Campo</th><th>Anterior</th><th>Nuevo</th><th>Modificado por</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {historial.map(h => (
                  <tr key={h.id}>
                    <td><strong>{h.campo}</strong></td>
                    <td>{h.valorAnterior}</td>
                    <td style={{ color: "var(--primary-600)" }}>{h.valorNuevo}</td>
                    <td>{h.modificadoPor}</td>
                    <td>{new Date(h.createdAt).toLocaleString("es-CO")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="modal-buttons">
          <Button variant="secondary" onClick={() => setMostrarModalHistorial(false)}>Cerrar</Button>
        </div>
      </Modal>
    </div>
  );
}
export default MisCitas;