import { useEffect, useState } from "react";
import { getHorasDisponibles } from "../services/citas.service";
import { getAuthHeaders } from "../../auth/authService";
import { Button, Card, Modal, Spinner, useToast } from "../../components/UI";
import { Search, UserRound, Calendar, Clock, Stethoscope, CheckCircle, XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL_CITAS = `${API_URL}/citas`;

interface MisCitasProps { rol?: "admin" | "agendador" | "medico" | "paciente"; }

function MisCitas({ rol = "paciente" }: MisCitasProps) {
  const toast = useToast();
  const [documentoBusqueda, setDocumentoBusqueda] = useState("");
  const [documentoIngresado, setDocumentoIngresado] = useState("");
  const [datosPaciente, setDatosPaciente] = useState<any>(null);
  const [buscando, setBuscando] = useState(false);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(rol === "paciente");
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState("");
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

  const normalizeList = (data: any) => Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  const cargarCitasMedico = async () => {
    setCargando(true);
    try {
      const authHeaders = await getAuthHeaders();
      const params = filtroFecha ? `?fecha=${filtroFecha}` : "";
      const res = await fetch(`${URL_CITAS}/mis-citas${params}`, { headers: authHeaders });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCitas(normalizeList(data));
    } catch { toast.error("Error al cargar citas"); setCitas([]); } finally { setCargando(false); }
  };

  const buscarCitasPorDocumento = async () => {
    if (!documentoBusqueda.trim()) { toast.error("Ingrese un documento"); return; }
    setBuscando(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/por-documento/${documentoBusqueda.trim()}`, { headers: authHeaders });
      if (!res.ok) { if (res.status === 404) toast.error("No se encontró paciente"); setCitas([]); setDatosPaciente(null); return; }
      const data = await res.json();
      setCitas(normalizeList(data.data || data));
      setDatosPaciente(data.paciente || null);
      setDocumentoIngresado(documentoBusqueda.trim());
      setMostrarBusqueda(false);
    } catch { toast.error("Error al buscar"); setCitas([]); setDatosPaciente(null); } finally { setBuscando(false); }
  };

  const marcarAsistencia = async (citaId: number, asistio: boolean) => {
    setMarcandoAsistenciaId(citaId);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaId}/asistencia`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ asistio, metodo: "MANUAL" }),
      });
      if (!res.ok) throw new Error();
      toast.success(asistio ? "Paciente marcado como atendido" : "Asistencia actualizada");
      // Recargar citas
      if (rol === "medico") await cargarCitasMedico();
      else await buscarCitasPorDocumento();
    } catch {
      toast.error("Error al marcar asistencia");
    } finally {
      setMarcandoAsistenciaId(null);
    }
  };

  useEffect(() => { if (rol === "medico") cargarCitasMedico(); }, [rol, filtroFecha]);
  useEffect(() => { if (citaSeleccionada && nuevaFechaReag) { setCargandoHorasReag(true); getHorasDisponibles(citaSeleccionada.medicoId, nuevaFechaReag).then(h => setHorasDisponiblesReag(Array.isArray(h) ? h : [])).catch(() => setHorasDisponiblesReag([])).finally(() => setCargandoHorasReag(false)); } }, [citaSeleccionada, nuevaFechaReag]);

  const abrirModalReagendar = (cita: any) => { setCitaSeleccionada(cita); setNuevaFechaReag(cita.fecha); setNuevaHoraReag(cita.hora); setErrFechaReag(""); setErrHoraReag(""); setMostrarModalReagendar(true); };
  const reagendarCita = async () => { if (!nuevaFechaReag || !nuevaHoraReag) { if (!nuevaFechaReag) setErrFechaReag("Seleccione fecha"); if (!nuevaHoraReag) setErrHoraReag("Seleccione hora"); return; } setCargandoReagendar(true); try { const authHeaders = await getAuthHeaders(); const res = await fetch(`${URL_CITAS}/${citaSeleccionada.id}/reagendar`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders }, body: JSON.stringify({ fecha: nuevaFechaReag, hora: nuevaHoraReag }) }); if (!res.ok) throw new Error(); toast.success("Cita reagendada"); setMostrarModalReagendar(false); if (rol === "medico") cargarCitasMedico(); else buscarCitasPorDocumento(); } catch { toast.error("Error al reagendar"); } finally { setCargandoReagendar(false); } };
  const verHistorial = async (citaId: number) => { setMostrarModalHistorial(true); setCargandoHistorial(true); try { const authHeaders = await getAuthHeaders(); const res = await fetch(`${URL_CITAS}/${citaId}/historial`, { headers: authHeaders }); setHistorial(await res.json()); } catch { toast.error("Error al cargar historial"); setHistorial([]); } finally { setCargandoHistorial(false); } };
  const volverABuscar = () => { setMostrarBusqueda(true); setDocumentoBusqueda(""); setDocumentoIngresado(""); setCitas([]); setDatosPaciente(null); };
  const exportarCSV = async () => { setCargando(true); try { const authHeaders = await getAuthHeaders(); const params = filtroFecha ? `?fecha=${filtroFecha}` : ""; const res = await fetch(`${URL_CITAS}/exportar-csv${params}`, { headers: authHeaders }); if (!res.ok) throw new Error(); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `citas${filtroFecha ? "_" + filtroFecha : ""}.csv`; a.click(); URL.revokeObjectURL(url); toast.success("CSV exportado"); } catch { toast.error("Error al exportar"); } finally { setCargando(false); } };

  if (mostrarBusqueda && rol === "paciente") return (<div><div className="page-header"><h2>📋 Mis Citas</h2><p>Ingresa tu documento</p></div><Card><div style={{ textAlign: "center", padding: 20 }}><UserRound size={48} /><input className="input-field" placeholder="Documento" value={documentoBusqueda} onChange={e => setDocumentoBusqueda(e.target.value)} onKeyDown={e => e.key === "Enter" && buscarCitasPorDocumento()} style={{ marginTop: 16 }} /><Button variant="primary" onClick={buscarCitasPorDocumento} loading={buscando} style={{ marginTop: 16 }}>Buscar mis citas</Button></div></Card></div>);

  return (<div><div className="page-header"><h2>{rol === "medico" ? "🩺 Mi Agenda" : "📋 Mis Citas"}</h2><p>{rol === "medico" ? "Tus citas agendadas" : datosPaciente ? `Paciente: ${datosPaciente.nombres} ${datosPaciente.apellidos}` : "Tus citas"}</p></div>
    <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}><input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} className="date-input" /><Button variant="primary" size="sm" onClick={() => rol === "medico" ? cargarCitasMedico() : buscarCitasPorDocumento()}>Filtrar</Button><Button variant="secondary" size="sm" onClick={() => setFiltroFecha("")}>Limpiar</Button>{rol === "paciente" && <Button variant="secondary" size="sm" onClick={volverABuscar}>Buscar otro</Button>}{rol === "medico" && <Button variant="secondary" size="sm" onClick={exportarCSV}>📥 Exportar CSV</Button>}</div>
    <Card>{cargando ? <Spinner /> : citas.length === 0 ? <div className="empty-state">No hay citas</div> : (<div className="table-wrapper"><table className="data-table"><thead><tr><th>Fecha</th><th>Hora</th>{rol === "medico" && <th>Paciente</th>}{rol === "medico" && <th>Documento</th>}{(rol === "paciente" || rol === "admin" || rol === "agendador") && <th>Especialista</th>}<th>Estado</th><th>Asistencia</th><th>Motivo</th><th>Acciones</th></tr></thead><tbody>{citas.map((cita: any) => (<tr key={cita.id}><td>{cita.fecha}</td><td>{cita.hora}</td>{rol === "medico" && (<><td><strong>{cita.paciente?.nombres} {cita.paciente?.apellidos}</strong></td><td>{cita.paciente?.documento}</td></>)}{(rol === "paciente" || rol === "admin" || rol === "agendador") && <td>{cita.medico?.nombre}</td>}<td><span className={`badge ${cita.estado === "AGENDADA" ? "badge-warning" : cita.estado === "CANCELADA" ? "badge-danger" : "badge-success"}`}>{cita.estado}</span></td>
              <td>
                {cita.asistio ? (
                  <span className="badge badge-success" style={{ background: "#10b981", color: "white" }}>✅ Asistió</span>
                ) : (
                  <Button variant="success" size="sm" onClick={() => marcarAsistencia(cita.id, true)} loading={marcandoAsistenciaId === cita.id} style={{ background: "#10b981", padding: "4px 8px", fontSize: "0.7rem" }}>
                    ✅ Marcar
                  </Button>
                )}
              </td>
              <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{cita.descripcion || "—"}</td>
              <td className="actions-cell" style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={() => abrirModalReagendar(cita)}>🔄</Button>
                <Button variant="info" size="sm" onClick={() => verHistorial(cita.id)}>📜</Button>
              </td>
            </tr>))}</tbody></table></div>)}</Card>
    <Modal isOpen={mostrarModalReagendar} onClose={() => setMostrarModalReagendar(false)} title="Reagendar Cita"><p>Fecha actual: {citaSeleccionada?.fecha} - {citaSeleccionada?.hora}</p><input type="date" className="input-field" value={nuevaFechaReag} onChange={e => { setNuevaFechaReag(e.target.value); setErrFechaReag(""); }} /><select className="input-field" value={nuevaHoraReag} onChange={e => setNuevaHoraReag(e.target.value)} disabled={cargandoHorasReag}><option value="">Seleccione hora</option>{horasDisponiblesReag.map(h => <option key={h} value={h}>{h}</option>)}</select><div className="modal-buttons"><Button variant="primary" onClick={reagendarCita} loading={cargandoReagendar}>Guardar</Button><Button variant="secondary" onClick={() => setMostrarModalReagendar(false)}>Cancelar</Button></div></Modal>
    <Modal isOpen={mostrarModalHistorial} onClose={() => setMostrarModalHistorial(false)} title="Historial" size="lg">{cargandoHistorial ? <Spinner /> : historial.length === 0 ? <p>Sin cambios</p> : <div className="table-wrapper"><table className="data-table"><thead><tr><th>Campo</th><th>Anterior</th><th>Nuevo</th><th>Modificado por</th><th>Fecha</th></tr></thead><tbody>{historial.map((h: any) => (<tr key={h.id}><td>{h.campo}</td><td>{h.valorAnterior}</td><td style={{ color: "var(--primary-600)" }}>{h.valorNuevo}</td>
                    <td>{h.modificadoPor}</td>
                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                  </tr>))}</tbody></table></div>}</Modal></div>);
}
export default MisCitas;