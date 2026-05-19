import { useEffect, useState } from "react";
import { getHorasDisponibles } from "../services/citas.service";
import { getAuthHeaders } from "../../auth/authService";

const URL = "http://localhost:3000/citas";

function MisCitas() {
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [appliedFecha, setAppliedFecha] = useState("");

  const [citaSeleccionada, setCitaSeleccionada] = useState<any>(null);
  const [mostrarModalReagendar, setMostrarModalReagendar] = useState(false);
  const [nuevaFechaReag, setNuevaFechaReag] = useState("");
  const [nuevaHoraReag, setNuevaHoraReag] = useState("");
  const [cargandoReagendar, setCargandoReagendar] = useState(false);
  const [horasDisponiblesReag, setHorasDisponiblesReag] = useState<string[]>([]);
  const [cargandoHorasReag, setCargandoHorasReag] = useState(false);

  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const normalizeList = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const cargarMisCitas = async (fecha: string = appliedFecha) => {
    setCargando(true);
    try {
      const authHeaders = await getAuthHeaders();
      const params = new URLSearchParams();
      if (fecha) params.set("fecha", fecha);
      const suffix = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${URL}/mis-citas${suffix}`, { headers: authHeaders });
      if (!res.ok) throw new Error("Error al cargar citas");
      const data = await res.json();
      setCitas(normalizeList(data));
    } catch (error) {
      console.error(error);
      setCitas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMisCitas();
  }, [appliedFecha]);

  useEffect(() => {
    if (citaSeleccionada && nuevaFechaReag) {
      const cargarHorasReag = async () => {
        setCargandoHorasReag(true);
        try {
          const horas = await getHorasDisponibles(citaSeleccionada.medicoId, nuevaFechaReag);
          setHorasDisponiblesReag(horas);
        } catch (error) {
          setHorasDisponiblesReag([]);
        } finally {
          setCargandoHorasReag(false);
        }
      };
      cargarHorasReag();
    } else {
      setHorasDisponiblesReag([]);
    }
  }, [citaSeleccionada, nuevaFechaReag]);

  const abrirModalReagendar = (cita: any) => {
    setCitaSeleccionada(cita);
    setNuevaFechaReag(cita.fecha);
    setNuevaHoraReag(cita.hora);
    setMostrarModalReagendar(true);
  };

  const reagendarCita = async () => {
    if (!citaSeleccionada) return;
    if (!nuevaFechaReag || !nuevaHoraReag) {
      alert("Seleccione nueva fecha y hora");
      return;
    }
    setCargandoReagendar(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL}/${citaSeleccionada.id}/reagendar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ fecha: nuevaFechaReag, hora: nuevaHoraReag }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al reagendar");
      }
      alert("Cita reagendada");
      setMostrarModalReagendar(false);
      cargarMisCitas();
    } catch (error: any) {
      alert(error.message || "Error al reagendar");
    } finally {
      setCargandoReagendar(false);
    }
  };

  const verHistorial = async (citaId: number) => {
    setMostrarModalHistorial(true);
    setCargandoHistorial(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL}/${citaId}/historial`, { headers: authHeaders });
      if (!res.ok) throw new Error("Error al cargar historial");
      const data = await res.json();
      setHistorial(data);
    } catch (error) {
      console.error(error);
      alert("Error al cargar historial");
      setHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const buscarConFiltros = async () => {
    setAppliedFecha(filtroFecha);
  };

  const limpiarFiltros = async () => {
    setFiltroFecha("");
    setAppliedFecha("");
  };

  return (
    <div>
      <div className="page-header">
        <h2>Mis Citas</h2>
        <p>Consulta y gestiona tus citas agendadas</p>
      </div>

      <div className="card-custom">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="date-input"
          />
          <button className="btn btn-primary" onClick={buscarConFiltros}>
            Buscar
          </button>
          <button className="btn btn-secondary" onClick={limpiarFiltros}>
            Limpiar
          </button>
        </div>
      </div>

      <div className="card-custom">
        {cargando ? (
          <p>Cargando...</p>
        ) : citas.length === 0 ? (
          <div className="empty-state"><p>No tienes citas agendadas</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {citas.map((cita) => (
                  <tr key={cita.id}>
                    <td>{cita.fecha}</td>
                    <td>{cita.hora}</td>
                    <td>{cita.paciente?.nombres} {cita.paciente?.apellidos}</td>
                    <td>
                      <span className={`badge ${cita.estado === "AGENDADA" ? "badge-warning" : "badge-success"}`}>
                        {cita.estado === "AGENDADA" ? "Programada" : "Confirmada"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" style={{ marginRight: 8 }} onClick={() => abrirModalReagendar(cita)}>
                        Reagendar
                      </button>
                      <button className="btn btn-info btn-sm" onClick={() => verHistorial(cita.id)}>
                        Ver historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarModalReagendar && citaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reagendar Cita</h3>
            <p><strong>Paciente:</strong> {citaSeleccionada.paciente?.nombres} {citaSeleccionada.paciente?.apellidos}</p>
            <div className="form-group"><label>Nueva fecha</label><input type="date" value={nuevaFechaReag} onChange={e => setNuevaFechaReag(e.target.value)} /></div>
            <div className="form-group">
              <label>Nueva hora</label>
              <select value={nuevaHoraReag} onChange={e => setNuevaHoraReag(e.target.value)} disabled={cargandoHorasReag}>
                <option value="">Seleccione hora</option>
                {horasDisponiblesReag.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              {cargandoHorasReag && <small>Cargando horarios...</small>}
            </div>
            <div className="modal-buttons">
              <button className="btn btn-primary" onClick={reagendarCita} disabled={cargandoReagendar}>
                {cargandoReagendar ? "Guardando..." : "Guardar cambios"}
              </button>
              <button className="btn btn-secondary" onClick={() => setMostrarModalReagendar(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalHistorial && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Historial de cambios</h3>
            {cargandoHistorial ? <p>Cargando...</p> : historial.length === 0 ? <p>No hay cambios registrados.</p> : (
              <table className="data-table">
                <thead><tr><th>Campo</th><th>Valor anterior</th><th>Valor nuevo</th><th>Modificado por</th><th>Fecha</th></tr></thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.id}><td>{h.campo}</td><td>{h.valorAnterior}</td><td>{h.valorNuevo}</td><td>{h.modificadoPor}</td><td>{new Date(h.createdAt).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="modal-buttons"><button className="btn btn-secondary" onClick={() => setMostrarModalHistorial(false)}>Cerrar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MisCitas;
