import { useEffect, useState, useCallback } from "react";
import { getHorasDisponibles } from "../services/citas.service";
import { getMedicos } from "../services/medicos.service";
import { getAuthHeaders } from "../../auth/authService";
import { Button, Card, Modal, Spinner, useToast } from "../../components/UI";
import ModalNotas from "../../components/molecules/ModalNotas";
import { obtenerNotasPublic } from "../services/citas.service";
import { Search, UserRound, Calendar, Clock, FileText, Download } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL_CITAS = `${API_URL}/citas`;

interface MisCitasProps { 
  rol?: "admin" | "agendador" | "medico" | "paciente";
  esAnonimo?: boolean;
}

function MisCitas({ rol = "paciente", esAnonimo = false }: MisCitasProps) {
  const toast = useToast();
  const [documentoBusqueda, setDocumentoBusqueda] = useState("");
  const [datosPaciente, setDatosPaciente] = useState<any>(null);
  const [buscando, setBuscando] = useState(false);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(true);
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [medicoSeleccionadoId, setMedicoSeleccionadoId] = useState<string>("");
  const [medicos, setMedicos] = useState<any[]>([]);
  const [cargandoMedicos, setCargandoMedicos] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<any>(null);
  const [mostrarModalReagendar, setMostrarModalReagendar] = useState(false);
  const [nuevaFechaReag, setNuevaFechaReag] = useState("");
  const [nuevaHoraReag, setNuevaHoraReag] = useState("");
  const [cargandoReagendar, setCargandoReagendar] = useState(false);
  const [horasDisponiblesReag, setHorasDisponiblesReag] = useState<string[]>([]);
  const [cargandoHorasReag, setCargandoHorasReag] = useState(false);
  const [errFechaReag, setErrFechaReag] = useState("");
  const [errHoraReag, setErrHoraReag] = useState("");
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [marcandoAsistenciaId, setMarcandoAsistenciaId] = useState<number | null>(null);
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [exportandoCSV, setExportandoCSV] = useState(false);
  
  const [mostrarModalNotas, setMostrarModalNotas] = useState(false);
  const [citaParaNotas, setCitaParaNotas] = useState<any>(null);

  // Estados para notas del paciente (solo lectura)
  const [mostrarModalNotasPaciente, setMostrarModalNotasPaciente] = useState(false);
  const [notasPaciente, setNotasPaciente] = useState<any[]>([]);
  const [cargandoNotasPaciente, setCargandoNotasPaciente] = useState(false);
  const [citaSeleccionadaNotas, setCitaSeleccionadaNotas] = useState<any>(null);

  const normalizeList = (data: any) => Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  const cargarMedicos = useCallback(async () => {
    if (rol === "paciente" && !esAnonimo) return;
    setCargandoMedicos(true);
    try {
      const data = await getMedicos(esAnonimo);
      setMedicos(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) { console.error(err); } finally { setCargandoMedicos(false); }
  }, [rol, esAnonimo]);

  const cargarCitas = useCallback(async () => {
    if ((rol === "paciente" || esAnonimo) && !datosPaciente) return;
    setCargando(true);
    try {
      const authHeaders = await getAuthHeaders();
      const params = new URLSearchParams();
      if (medicoSeleccionadoId && (rol === "admin" || rol === "agendador" || rol === "medico")) params.set("medicoId", medicoSeleccionadoId);
      if (filtroFecha) params.set("fecha", filtroFecha);
      params.set("limit", "100");
      const res = await fetch(`${URL_CITAS}${params.toString() ? `?${params}` : ""}`, { headers: authHeaders });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCitas(normalizeList(data.data || data));
    } catch { toast.error("Error al cargar citas"); setCitas([]); } finally { setCargando(false); }
  }, [rol, esAnonimo, datosPaciente, medicoSeleccionadoId, filtroFecha, toast]);

  const buscarCitasPorDocumento = useCallback(async () => {
    let documentoABuscar = documentoBusqueda;
    
    if (rol === "paciente" && !esAnonimo && !documentoABuscar) {
      try {
        const authHeaders = await getAuthHeaders();
        const meRes = await fetch(`${API_URL}/pacientes/me`, { headers: authHeaders });
        if (meRes.ok) {
          const miPerfil = await meRes.json();
          if (miPerfil?.documento) {
            documentoABuscar = miPerfil.documento;
          }
        }
      } catch (err) {
        console.error("Error obteniendo perfil:", err);
      }
    }
    
    if (!documentoABuscar?.trim()) { 
      toast.error("Ingrese un documento de identidad"); 
      return; 
    }
    
    setBuscando(true);
    try {
      let url: string;
      let headers: HeadersInit = {};
      
      if (esAnonimo) {
        url = `${API_URL}/citas/public/por-documento/${documentoABuscar.trim()}?todas=true`;
      } else {
        const authHeaders = await getAuthHeaders();
        headers = authHeaders;
        url = `${URL_CITAS}/por-documento/${documentoABuscar.trim()}?todas=true`;
      }
      
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        if (res.status === 400 || res.status === 403) {
          toast.error("Solo puedes ver tus propias citas");
          setCitas([]);
          setDatosPaciente(null);
          return;
        }
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
      setMostrarBusqueda(false);
      toast.success(`Se encontraron ${data.data?.length || 0} cita(s)`);
    } catch (err: any) {
      console.error("Error detallado:", err);
      toast.error("Error al buscar citas", err?.message);
      setCitas([]);
      setDatosPaciente(null);
    } finally {
      setBuscando(false);
    }
  }, [documentoBusqueda, rol, esAnonimo, toast]);

  const marcarAsistencia = async (citaId: number, asistio: boolean) => {
    setMarcandoAsistenciaId(citaId);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaId}/asistencia`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json", ...authHeaders }, 
        body: JSON.stringify({ asistio, metodo: "MANUAL" }) 
      });
      if (!res.ok) throw new Error();
      toast.success(asistio ? "Paciente marcado como atendido" : "Asistencia actualizada");
      if (rol === "paciente" || esAnonimo) await buscarCitasPorDocumento();
      else await cargarCitas();
    } catch { toast.error("Error al marcar asistencia"); } finally { setMarcandoAsistenciaId(null); }
  };

  const cancelarCita = async (citaId: number) => {
    const cita = citas.find(c => c.id === citaId);
    if (!cita) return;
    let mensaje = "¿Estás seguro de cancelar esta cita?";
    if (rol === "paciente") mensaje = "⚠️ Solo puedes cancelar con al menos 2 días de anticipación. ¿Deseas continuar?";
    if (!window.confirm(mensaje)) return;
    setCancelandoId(citaId);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaId}/cancelar`, { method: "PATCH", headers: authHeaders });
      if (!res.ok) throw new Error();
      toast.success("Cita cancelada correctamente");
      if (rol === "paciente" || esAnonimo) await buscarCitasPorDocumento();
      else await cargarCitas();
    } catch (err: any) { toast.error("Error", err.message); } finally { setCancelandoId(null); }
  };

  const abrirModalNotas = (cita: any) => {
    setCitaParaNotas(cita);
    setMostrarModalNotas(true);
  };

  const abrirModalReagendar = (cita: any) => {
    setCitaSeleccionada(cita);
    setNuevaFechaReag(cita.fecha);
    setNuevaHoraReag(cita.hora);
    setErrFechaReag("");
    setErrHoraReag("");
    setMostrarModalReagendar(true);
  };

  const verNotasPaciente = async (cita: any) => {
    setCitaSeleccionadaNotas(cita);
    setMostrarModalNotasPaciente(true);
    setCargandoNotasPaciente(true);
    try {
      const notas = await obtenerNotasPublic(cita.id);
      setNotasPaciente(Array.isArray(notas) ? notas : []);
    } catch (error) {
      console.error("Error cargando notas:", error);
      toast.error("Error al cargar notas médicas");
      setNotasPaciente([]);
    } finally {
      setCargandoNotasPaciente(false);
    }
  };

  const reagendarCita = async () => {
    if (!nuevaFechaReag || !nuevaHoraReag) {
      if (!nuevaFechaReag) setErrFechaReag("Seleccione fecha");
      if (!nuevaHoraReag) setErrHoraReag("Seleccione hora");
      return;
    }
    setCargandoReagendar(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaSeleccionada.id}/reagendar`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json", ...authHeaders }, 
        body: JSON.stringify({ fecha: nuevaFechaReag, hora: nuevaHoraReag }) 
      });
      if (!res.ok) throw new Error();
      toast.success("Cita reagendada exitosamente");
      setMostrarModalReagendar(false);
      if (rol === "paciente" || esAnonimo) await buscarCitasPorDocumento();
      else await cargarCitas();
    } catch { toast.error("Error al reagendar"); } finally { setCargandoReagendar(false); }
  };

  const verHistorial = async (citaId: number) => {
    setMostrarModalHistorial(true);
    setCargandoHistorial(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaId}/historial`, { headers: authHeaders });
      setHistorial(await res.json());
    } catch { toast.error("Error al cargar historial"); setHistorial([]); } finally { setCargandoHistorial(false); }
  };

  const exportarCSV = async () => {
    setExportandoCSV(true);
    try {
      const authHeaders = await getAuthHeaders();
      const params = new URLSearchParams();
      if (filtroFecha) params.set("fecha", filtroFecha);
      if (medicoSeleccionadoId && (rol === "admin" || rol === "agendador")) params.set("medicoId", medicoSeleccionadoId);
      const res = await fetch(`${URL_CITAS}/exportar-csv${params.toString() ? `?${params}` : ""}`, { headers: authHeaders });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `citas_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("CSV exportado correctamente");
    } catch { toast.error("Error al exportar"); } finally { setExportandoCSV(false); }
  };

  const volverABuscar = () => {
    setMostrarBusqueda(true);
    setDocumentoBusqueda("");
    setCitas([]);
    setDatosPaciente(null);
  };

  useEffect(() => {
    if (rol === "paciente" && !esAnonimo) return;
    cargarMedicos();
    if (rol !== "paciente" && !esAnonimo) cargarCitas();
  }, [rol, esAnonimo, cargarMedicos, cargarCitas]);

  useEffect(() => {
    if (citaSeleccionada && nuevaFechaReag) {
      setCargandoHorasReag(true);
      const fetchHoras = async () => {
        try {
          const horas = await getHorasDisponibles(citaSeleccionada.medicoId, nuevaFechaReag, esAnonimo);
          setHorasDisponiblesReag(Array.isArray(horas) ? horas : []);
        } catch {
          setHorasDisponiblesReag([]);
        } finally {
          setCargandoHorasReag(false);
        }
      };
      fetchHoras();
    }
  }, [citaSeleccionada, nuevaFechaReag, esAnonimo]);

  // Pantalla de búsqueda para pacientes anónimos o autenticados
  if (mostrarBusqueda && (rol === "paciente" || esAnonimo)) {
    return (
      <div>
        <div className="page-header">
          <h2>📋 Mis Citas</h2>
          <p>Ingresa tu número de documento para consultar tus citas</p>
        </div>
        <Card variant="elevated">
          <div style={{ maxWidth: 450, margin: "0 auto", textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 80, height: 80, background: "var(--primary-50)", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <UserRound size={40} color="var(--primary-500)" />
            </div>
            <h3>Consulta tus citas</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Ingresa tu número de documento de identidad</p>
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

  // Panel para médicos, admin, agendador (con todas las funcionalidades)
  if (rol !== "paciente" && !esAnonimo) {
    return (
      <div>
        <div className="page-header">
          <h2>{rol === "medico" ? "🩺 Gestión de Citas" : rol === "admin" ? "📋 Agenda de Citas" : "📋 Agenda de Citas"}</h2>
          <p>Administra todas las citas de la clínica</p>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <select 
            value={medicoSeleccionadoId} 
            onChange={(e) => setMedicoSeleccionadoId(e.target.value)} 
            className="input-field" 
            style={{ width: "220px" }} 
            disabled={cargandoMedicos}
          >
            <option value="">Todos los especialistas</option>
            {medicos.map((m: any) => (
              <option key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</option>
            ))}
          </select>
          <input 
            type="date" 
            value={filtroFecha} 
            onChange={(e) => setFiltroFecha(e.target.value)} 
            className="date-input" 
          />
          <Button variant="primary" size="sm" onClick={() => cargarCitas()}>🔍 Filtrar</Button>
          <Button variant="secondary" size="sm" onClick={() => { setFiltroFecha(""); setMedicoSeleccionadoId(""); cargarCitas(); }}>🗑️ Limpiar</Button>
          {(rol === "admin" || rol === "agendador" || rol === "medico") && (
            <Button variant="secondary" size="sm" onClick={exportarCSV} loading={exportandoCSV}>
              <Download size={14} /> Exportar CSV
            </Button>
          )}
        </div>

        <Card variant="elevated">
          {cargando ? (
            <Spinner text="Cargando citas..." />
          ) : citas.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} style={{ marginBottom: 16, color: "var(--text-muted)" }} />
              <p>No hay citas para mostrar</p>
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
                      <th><Calendar size={14} />Fecha</th>
                      <th><Clock size={14} />Hora</th>
                      <th>Paciente</th>
                      <th>Documento</th>
                      <th>Celular</th>
                      <th>Especialista</th>
                      <th>Especialidad</th>
                      <th>Estado</th>
                      <th>Asistencia</th>
                      <th>Motivo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.map((cita: any) => (
                      <tr key={cita.id}>
                        <td><strong>{cita.fecha}</strong></td>
                        <td>{cita.hora}</td>
                        <td><strong>{cita.paciente?.nombres} {cita.paciente?.apellidos}</strong></td>
                        <td>{cita.paciente?.documento || "—"}</td>
                        <td>{cita.paciente?.celular || "—"}</td>
                        <td>{cita.medico?.nombre || "—"}</td>
                        <td>{cita.medico?.especialidad || "—"}</td>
                        <td>
                          <span className={`badge ${cita.estado === "AGENDADA" ? "badge-warning" : cita.estado === "CANCELADA" ? "badge-danger" : "badge-success"}`}>
                            {cita.estado}
                          </span>
                        </td>
                        <td>
                          {cita.asistio ? (
                            <span className="badge badge-success" style={{ background: "#10b981", color: "white" }}>✅ Asistió</span>
                          ) : cita.estado !== "CANCELADA" ? (
                            <Button variant="success" size="sm" onClick={() => marcarAsistencia(cita.id, true)} loading={marcandoAsistenciaId === cita.id} style={{ background: "#10b981", padding: "4px 8px", fontSize: "0.7rem" }}>
                              ✅ Marcar
                            </Button>
                          ) : (
                            <span className="badge badge-neutral">Cancelada</span>
                          )}
                        </td>
                        <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{cita.descripcion || "—"}</td>
                        <td className="actions-cell" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {(rol === "admin" || rol === "agendador" || rol === "medico") && cita.estado !== "CANCELADA" && (
                            <Button variant="secondary" size="sm" onClick={() => abrirModalReagendar(cita)}>🔄 Reagendar</Button>
                          )}
                          {(rol === "admin" || rol === "agendador" || rol === "medico") && (
                            <Button variant="info" size="sm" onClick={() => verHistorial(cita.id)}>📜 Historial</Button>
                          )}
                          {rol === "medico" && cita.estado !== "CANCELADA" && (
                            <Button variant="outline" size="sm" onClick={() => abrirModalNotas(cita)}>
                              <FileText size={14} /> Notas
                            </Button>
                          )}
                          {cita.estado !== "CANCELADA" && (
                            <Button variant="danger" size="sm" onClick={() => cancelarCita(cita.id)} loading={cancelandoId === cita.id}>
                              Cancelar
                            </Button>
                          )}
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
          </div>
          <div className={`form-group ${errFechaReag ? "input-error" : ""}`}>
            <label className="input-label">Nueva fecha <span className="input-required">*</span></label>
            <input type="date" value={nuevaFechaReag} min={new Date().toISOString().split("T")[0]} onChange={e => { setNuevaFechaReag(e.target.value); setErrFechaReag(""); }} className="input-field" />
            {errFechaReag && <span className="input-error-message">{errFechaReag}</span>}
          </div>
          <div className={`form-group ${errHoraReag ? "input-error" : ""}`}>
            <label className="input-label">Nueva hora <span className="input-required">*</span></label>
            <select value={nuevaHoraReag} onChange={e => { setNuevaHoraReag(e.target.value); setErrHoraReag(""); }} disabled={cargandoHorasReag} className="input-field">
              <option value="">Seleccione hora</option>
              {horasDisponiblesReag.map(h => <option key={h} value={h}>{h}</option>)}
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
            <p>No hay cambios registrados.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Campo</th><th>Anterior</th><th>Nuevo</th><th>Modificado por</th><th>Fecha</th></tr>
                </thead>
                <tbody>
                  {historial.map((h: any) => (
                    <tr key={h.id}>
                      <td><strong>{h.campo}</strong></td>
                      <td>{h.valorAnterior}</td>
                      <td style={{ color: "var(--primary-600)" }}>{h.valorNuevo}</td>
                      <td>{h.modificadoPor}</td>
                      <td>{new Date(h.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="modal-buttons"><Button variant="secondary" onClick={() => setMostrarModalHistorial(false)}>Cerrar</Button></div>
        </Modal>

        {/* Modal Notas para médico */}
        <ModalNotas
          isOpen={mostrarModalNotas}
          onClose={() => { setMostrarModalNotas(false); setCitaParaNotas(null); }}
          citaId={citaParaNotas?.id}
          pacienteNombre={`${citaParaNotas?.paciente?.nombres || ''} ${citaParaNotas?.paciente?.apellidos || ''}`}
          medicoNombre={citaParaNotas?.medico?.nombre || ''}
          fecha={`${citaParaNotas?.fecha} ${citaParaNotas?.hora}`}
        />
      </div>
    );
  }

  // Vista para paciente autenticado o anónimo (solo consulta, cancelación y ver notas)
  return (
    <div>
      <div className="page-header">
        <h2>📋 Mis Citas</h2>
        <p>
          {datosPaciente 
            ? `Paciente: ${datosPaciente.nombres} ${datosPaciente.apellidos} · Doc: ${datosPaciente.documento}` 
            : "Tus citas agendadas"}
        </p>
        <Button variant="outline" size="sm" onClick={volverABuscar} style={{ marginTop: 8 }}>
          Buscar otro paciente
        </Button>
      </div>

      <Card variant="elevated">
        {cargando ? (
          <Spinner text="Cargando citas..." />
        ) : citas.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} style={{ marginBottom: 16, color: "var(--text-muted)" }} />
            <p>No hay citas para mostrar</p>
            <Button variant="primary" onClick={volverABuscar} style={{ marginTop: 16 }}>
              Buscar de nuevo
            </Button>
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
                    <th><Calendar size={14} />Fecha</th>
                    <th><Clock size={14} />Hora</th>
                    <th>Paciente</th>
                    <th>Documento</th>
                    <th>Celular</th>
                    <th>Especialista</th>
                    <th>Especialidad</th>
                    <th>Estado</th>
                    <th>Asistencia</th>
                    <th>Motivo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita: any) => (
                    <tr key={cita.id}>
                      <td><strong>{cita.fecha}</strong></td>
                      <td>{cita.hora}</td>
                      <td><strong>{cita.paciente?.nombres} {cita.paciente?.apellidos}</strong></td>
                      <td>{cita.paciente?.documento || "—"}</td>
                      <td>{cita.paciente?.celular || "—"}</td>
                      <td>{cita.medico?.nombre || "—"}</td>
                      <td>{cita.medico?.especialidad || "—"}</td>
                      <td>
                        <span className={`badge ${cita.estado === "AGENDADA" ? "badge-warning" : cita.estado === "CANCELADA" ? "badge-danger" : "badge-success"}`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td>
                        {cita.asistio ? (
                          <span className="badge badge-success" style={{ background: "#10b981", color: "white" }}>✅ Asistió</span>
                        ) : cita.estado !== "CANCELADA" ? (
                          <span className="badge badge-neutral">Pendiente</span>
                        ) : (
                          <span className="badge badge-neutral">Cancelada</span>
                        )}
                      </td>
                      <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{cita.descripcion || "—"}</td>
                      <td className="actions-cell" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Button variant="info" size="sm" onClick={() => verHistorial(cita.id)}>📜 Historial</Button>
                        <Button variant="outline" size="sm" onClick={() => verNotasPaciente(cita)}>📝 Ver Notas Médicas</Button>
                        {cita.estado !== "CANCELADA" && (
                          <Button variant="danger" size="sm" onClick={() => cancelarCita(cita.id)} loading={cancelandoId === cita.id}>
                            Cancelar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Modal Historial */}
      <Modal isOpen={mostrarModalHistorial} onClose={() => setMostrarModalHistorial(false)} title="📜 Historial de cambios" size="lg">
        {cargandoHistorial ? <Spinner text="Cargando historial..." /> : historial.length === 0 ? (
          <p>No hay cambios registrados.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Campo</th><th>Anterior</th><th>Nuevo</th><th>Modificado por</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {historial.map((h: any) => (
                  <tr key={h.id}>
                    <td><strong>{h.campo}</strong></td>
                    <td>{h.valorAnterior}</td>
                    <td style={{ color: "var(--primary-600)" }}>{h.valorNuevo}</td>
                    <td>{h.modificadoPor}</td>
                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="modal-buttons"><Button variant="secondary" onClick={() => setMostrarModalHistorial(false)}>Cerrar</Button></div>
      </Modal>

      {/* Modal Notas para Paciente (solo lectura) */}
      <Modal isOpen={mostrarModalNotasPaciente} onClose={() => setMostrarModalNotasPaciente(false)} title="📋 Notas Médicas" size="lg">
        <div style={{ marginBottom: 16, padding: 12, background: "var(--primary-50)", borderRadius: 12 }}>
          <p><strong>👤 Paciente:</strong> {citaSeleccionadaNotas?.paciente?.nombres} {citaSeleccionadaNotas?.paciente?.apellidos}</p>
          <p><strong>👨‍⚕️ Médico:</strong> {citaSeleccionadaNotas?.medico?.nombre}</p>
          <p><strong>📅 Fecha:</strong> {citaSeleccionadaNotas?.fecha} - {citaSeleccionadaNotas?.hora}</p>
        </div>

        {cargandoNotasPaciente ? (
          <Spinner size="sm" text="Cargando notas médicas..." />
        ) : notasPaciente.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            <p>No hay notas médicas registradas para esta cita.</p>
            <small>Las notas son agregadas por el médico durante la consulta.</small>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {notasPaciente.map((nota, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--slate-50)",
                  padding: 16,
                  borderRadius: 12,
                  borderLeft: "4px solid var(--primary-500)"
                }}
              >
                <div style={{ marginBottom: 8, fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  <span>📅 {new Date(nota.creadoEn).toLocaleString("es-CO")}</span>
                  <span style={{ marginLeft: 16 }}>👨‍⚕️ Dr(a). {nota.creadoPor}</span>
                </div>
                <p style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "0.9rem" }}>
                  {nota.contenido}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="modal-buttons" style={{ marginTop: 20 }}>
          <Button variant="secondary" onClick={() => setMostrarModalNotasPaciente(false)}>Cerrar</Button>
        </div>
      </Modal>
    </div>
  );
}

export default MisCitas;