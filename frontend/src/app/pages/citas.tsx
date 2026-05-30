import { useEffect, useState } from "react";
import { getCitas, crearCita, getHorasDisponibles } from "../services/citas.service";
import { buscarPacientePorDocumento, crearPaciente } from "../services/pacientes.service";
import { getMedicos } from "../services/medicos.service";
import { getAuthHeaders } from "../../auth/authService";
import { Button, Input, Card, Modal, Spinner, useToast } from "../../components/UI";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, AlertCircle, Calendar, Clock, Search, UserPlus } from "lucide-react";

type Genero = "Hombre" | "Mujer" | "Otro";
interface CitasProps { rol?: "admin" | "agendador" | "paciente" | "medico"; }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const celularRegex = /^[0-9]{7,15}$/;
const docRegex = /^[A-Za-z0-9]{4,20}$/;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL_CITAS = `${API_URL}/citas`;

function Citas({ rol = "agendador" }: CitasProps) {
  const toast = useToast();
  const puedeEditar = rol === "admin" || rol === "agendador";

  const [citas, setCitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [mostrandoListado, setMostrandoListado] = useState(true);
  const [cargandoCitas, setCargandoCitas] = useState(false);
  const [creando, setCreando] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const [orden, setOrden] = useState<"asc" | "desc">("asc");
  const limit = 10;

  const [filtroMedicoId, setFiltroMedicoId] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [appliedMedicoId, setAppliedMedicoId] = useState("");
  const [appliedFecha, setAppliedFecha] = useState("");

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [horasDelTurno, setHorasDelTurno] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  const [errFecha, setErrFecha] = useState("");
  const [errMedico, setErrMedico] = useState("");
  const [errPaciente, setErrPaciente] = useState("");
  const [errHora, setErrHora] = useState("");
  const [mensajeHorario, setMensajeHorario] = useState<{ tipo: "info" | "warning" | "error"; texto: string } | null>(null);

  const [docBusqueda, setDocBusqueda] = useState("");
  const [errDoc, setErrDoc] = useState("");
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [pacienteExistente, setPacienteExistente] = useState<any>(null);
  const [mostrarFormPaciente, setMostrarFormPaciente] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState({ documento: "", nombres: "", apellidos: "", celular: "", genero: "Otro" as Genero, fechaNacimiento: "", email: "" });
  const [erroresPaciente, setErroresPaciente] = useState<Record<string, string>>({});
  const [registrandoPaciente, setRegistrandoPaciente] = useState(false);

  const [citaSeleccionada, setCitaSeleccionada] = useState<any>(null);
  const [mostrarModalReagendar, setMostrarModalReagendar] = useState(false);
  const [nuevaFechaReag, setNuevaFechaReag] = useState("");
  const [nuevaHoraReag, setNuevaHoraReag] = useState("");
  const [cargandoReagendar, setCargandoReagendar] = useState(false);
  const [horasDisponiblesReag, setHorasDisponiblesReag] = useState<string[]>([]);
  const [cargandoHorasReag, setCargandoHorasReag] = useState(false);
  const [codigoVerificacion, setCodigoVerificacion] = useState("");
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);
  const [errReagFecha, setErrReagFecha] = useState("");
  const [errReagHora, setErrReagHora] = useState("");

  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const [exportMedicoId, setExportMedicoId] = useState("");
  const [exportFecha, setExportFecha] = useState("");

  const normalizeList = (data: any) => Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  const cargarCitas = async (p = page, o = orden, mid = appliedMedicoId, fec = appliedFecha) => {
    setCargandoCitas(true);
    try {
      const data = await getCitas({ medicoId: mid ? Number(mid) : undefined, fecha: fec || undefined, page: p, limit, order: o });
      const lista = normalizeList(data);
      setCitas(lista);
      setTotalResultados(typeof data?.total === "number" ? data.total : lista.length);
      setTotalPages(typeof data?.totalPages === "number" ? data.totalPages : Math.ceil((data?.total ?? lista.length) / limit) || 1);
    } catch { toast.error("Error al cargar citas"); }
    finally { setCargandoCitas(false); }
  };

  const cargarTodo = async () => {
    try {
      const [pac, med] = await Promise.all([
        fetch(`${API_URL}/pacientes`, { headers: await getAuthHeaders() }).then(r => r.json()),
        getMedicos()
      ]);
      setPacientes(normalizeList(pac));
      setMedicos(normalizeList(med));
    } catch {}
    await cargarCitas(1);
  };

  useEffect(() => { cargarTodo(); }, []);
  useEffect(() => { cargarCitas(page, orden, appliedMedicoId, appliedFecha); }, [page, orden, appliedMedicoId, appliedFecha]);

  const medicosUnicos = Array.from(new Map(medicos.map((m: any) => [m.id, m])).values());

    // Cargar horas disponibles cuando cambia médico o fecha
  useEffect(() => {
    if (!medicoId || !fecha) {
      setHorasDisponibles([]);
      setHorasDelTurno([]);
      setMensajeHorario(null);
      return;
    }
    
    const cargar = async () => {
      setCargandoHoras(true);
      setMensajeHorario(null);
      
      try {
        const respuesta = await getHorasDisponibles(Number(medicoId), fecha);
        
        // ===== CORRECCIÓN: Normalizar respuesta =====
        let horas: string[] = [];
        
        if (Array.isArray(respuesta)) {
          horas = respuesta;
        } else if (respuesta && Array.isArray(respuesta.horas)) {
          horas = respuesta.horas;
        } else if (respuesta && Array.isArray(respuesta.data)) {
          horas = respuesta.data;
        } else if (respuesta && respuesta.message) {
          setMensajeHorario({ 
            tipo: "error", 
            texto: `❌ ${respuesta.message || "Error al cargar horarios"}` 
          });
          setHorasDisponibles([]);
          setHorasDelTurno([]);
          setCargandoHoras(false);
          return;
        } else {
          console.warn("⚠️ Respuesta inesperada de horas disponibles:", respuesta);
          setHorasDisponibles([]);
        }
        
        setHorasDisponibles(horas);
        
        // ===== Generar horas del turno según configuración del médico =====
        const medicoSel = medicos.find((m: any) => m.id === Number(medicoId));
        const config = medicoSel?.configuracion;
        
        if (!config) {
          setMensajeHorario({ tipo: "warning", texto: "⚠️ Este médico no tiene configuración de horario. Contacta al administrador." });
          setHorasDelTurno([]);
          setCargandoHoras(false);
          return;
        }
        
        const diasAtencion: string[] = Array.isArray(config.diasAtencion) ? config.diasAtencion : [];
        const norm = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
        const [y, m2, d] = fecha.split("-").map(Number);
        const diaSeleccionado = ["DOMINGO","LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO"][new Date(y, m2 - 1, d).getDay()];
        
        if (!diasAtencion.map(norm).includes(norm(diaSeleccionado))) {
          setMensajeHorario({ 
            tipo: "info", 
            texto: `📅 El Dr/a. ${medicoSel?.nombre} no atiende los ${diaSeleccionado.toLowerCase()}s. Días de atención: ${diasAtencion.join(", ")}` 
          });
          setHorasDelTurno([]);
          setCargandoHoras(false);
          return;
        }
        
        const [ih, im] = (config.horaInicio || "08:00").split(":").map(Number);
        const [fh, fm] = (config.horaFin || "17:00").split(":").map(Number);
        const intervalo = Number(config.intervaloMinutos) || 30;
        let cur = ih * 60 + im;
        const fin = fh * 60 + fm;
        const todas: string[] = [];
        
        while (cur < fin) {
          const h = Math.floor(cur / 60);
          const mm = cur % 60;
          todas.push(`${String(h).padStart(2,"0")}:${String(mm).padStart(2,"0")}`);
          cur += intervalo;
        }
        setHorasDelTurno(todas);
        
        if (horas.length === 0 && todas.length > 0) {
          setMensajeHorario({ tipo: "info", texto: "ℹ️ No hay horarios disponibles para esta fecha. Todas las citas están ocupadas." });
        } else if (horas.length > 0) {
          setMensajeHorario({ tipo: "info", texto: `✅ ${horas.length} horario(s) disponible(s) para esta fecha.` });
        }
      } catch (error: any) {
        console.error("❌ Error cargando horas:", error);
        setMensajeHorario({ tipo: "error", texto: "❌ Error al cargar horarios. Intenta de nuevo." });
        setHorasDisponibles([]);
        setHorasDelTurno([]);
      } finally {
        setCargandoHoras(false);
      }
    };
    
    cargar();
  }, [medicoId, fecha, medicos]);
  

  useEffect(() => { if (hora && !horasDisponibles.includes(hora)) setHora(""); }, [hora, horasDisponibles]);

  const buscarPaciente = async () => {
    setErrDoc("");
    if (!docBusqueda.trim()) { setErrDoc("Ingrese un número de documento"); return; }
    if (!docRegex.test(docBusqueda.trim())) { setErrDoc("Documento inválido (4-20 caracteres alfanuméricos)"); return; }
    setBuscandoPaciente(true);
    const p = await buscarPacientePorDocumento(docBusqueda.trim());
    if (p) { setPacienteExistente(p); setPacienteId(p.id.toString()); setMostrarFormPaciente(false); }
    else { setPacienteExistente(null); setMostrarFormPaciente(true); setNuevoPaciente(prev => ({ ...prev, documento: docBusqueda.trim() })); }
    setBuscandoPaciente(false);
  };

  const validarNuevoPaciente = (): boolean => {
    const e: Record<string, string> = {};
    if (!nuevoPaciente.nombres.trim()) e.nombres = "El nombre es obligatorio";
    if (!nuevoPaciente.apellidos.trim()) e.apellidos = "Los apellidos son obligatorios";
    if (!celularRegex.test(nuevoPaciente.celular)) e.celular = "Celular inválido (7-15 dígitos)";
    if (nuevoPaciente.email && !emailRegex.test(nuevoPaciente.email)) e.email = "Email inválido";
    setErroresPaciente(e);
    return Object.keys(e).length === 0;
  };

  const registrarNuevoPaciente = async () => {
    if (!validarNuevoPaciente()) return;
    setRegistrandoPaciente(true);
    try {
      const nuevo = await crearPaciente({ ...nuevoPaciente, documento: docBusqueda.trim() } as any);
      setPacienteId(nuevo.id.toString()); setMostrarFormPaciente(false); setPacienteExistente(nuevo);
      toast.success("Paciente registrado", `${nuevo.nombres} ${nuevo.apellidos}`);
    } catch (err: any) { toast.error("Error al registrar paciente", err?.message); }
    finally { setRegistrandoPaciente(false); }
  };

  const validarCita = (): boolean => {
    let ok = true;
    if (!fecha) { setErrFecha("Seleccione una fecha"); ok = false; } else { setErrFecha(""); }
    if (!medicoId) { setErrMedico("Seleccione un especialista"); ok = false; } else { setErrMedico(""); }
    if (!pacienteId) { setErrPaciente("Seleccione o registre un paciente"); ok = false; } else { setErrPaciente(""); }
    if (!hora) { setErrHora("Seleccione una hora disponible"); ok = false; } else { setErrHora(""); }
    return ok;
  };

  const crear = async () => {
    if (!validarCita()) return;
    setCreando(true);
    try {
      const nuevaCita = await crearCita({ fecha, hora, pacienteId: Number(pacienteId), medicoId: Number(medicoId), descripcion, estado: "AGENDADA" });
      toast.success("¡Cita agendada!", `${fecha} a las ${hora}`);
      if (nuevaCita?.codigoVerificacion) {
        setCodigoVerificacion(String(nuevaCita.codigoVerificacion));
        setMostrarModalCodigo(true);
      }
      setFecha(""); setHora(""); setPacienteId(""); setMedicoId(""); setDescripcion("");
      setDocBusqueda(""); setPacienteExistente(null); setMostrarFormPaciente(false);
      setNuevoPaciente({ documento: "", nombres: "", apellidos: "", celular: "", genero: "Otro", fechaNacimiento: "", email: "" });
      cargarTodo();
    } catch (err: any) { toast.error("No se pudo agendar", err?.message); }
    finally { setCreando(false); }
  };

  const copiarCodigoVerificacion = async () => {
    if (!codigoVerificacion) return;
    try {
      await navigator.clipboard.writeText(codigoVerificacion);
      toast.success("Código copiado", codigoVerificacion);
    } catch {
      toast.error("No se pudo copiar el código");
    }
  };

  const descargarCodigoQR = () => {
    const canvas = document.getElementById("codigo-verificacion-qr") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-codigo-${codigoVerificacion || "cita"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cerrarModalCodigo = () => {
    setMostrarModalCodigo(false);
    setCodigoVerificacion("");
  };

  useEffect(() => {
    if (!citaSeleccionada || !nuevaFechaReag) { setHorasDisponiblesReag([]); return; }
    setCargandoHorasReag(true);
    getHorasDisponibles(citaSeleccionada.medicoId, nuevaFechaReag)
      .then(h => setHorasDisponiblesReag(h))
      .catch(() => setHorasDisponiblesReag([]))
      .finally(() => setCargandoHorasReag(false));
  }, [citaSeleccionada, nuevaFechaReag]);

  const abrirModalReagendar = (cita: any) => {
    setCitaSeleccionada(cita); setNuevaFechaReag(cita.fecha); setNuevaHoraReag(cita.hora);
    setErrReagFecha(""); setErrReagHora(""); setMostrarModalReagendar(true);
  };

  const reagendarCita = async () => {
    let ok = true;
    if (!nuevaFechaReag) { setErrReagFecha("Seleccione una fecha"); ok = false; } else setErrReagFecha("");
    if (!nuevaHoraReag) { setErrReagHora("Seleccione una hora"); ok = false; } else setErrReagHora("");
    if (!ok) return;
    setCargandoReagendar(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaSeleccionada.id}/reagendar`, {
        method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ fecha: nuevaFechaReag, hora: nuevaHoraReag }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Error al reagendar"); }
      toast.success("Cita reagendada", `Nueva fecha: ${nuevaFechaReag} a las ${nuevaHoraReag}`);
      setMostrarModalReagendar(false); cargarTodo();
    } catch (err: any) { toast.error("Error al reagendar", err.message); }
    finally { setCargandoReagendar(false); }
  };

  const verHistorial = async (citaId: number) => {
    setMostrarModalHistorial(true); setCargandoHistorial(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaId}/historial`, { headers: authHeaders });
      if (!res.ok) throw new Error("Error al cargar historial");
      setHistorial(await res.json());
    } catch { toast.error("Error al cargar historial"); setHistorial([]); }
    finally { setCargandoHistorial(false); }
  };

  const exportarCsv = async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const params = new URLSearchParams();
      if (exportMedicoId) params.set("medicoId", exportMedicoId);
      if (exportFecha) params.set("fecha", exportFecha);
      const res = await fetch(`${URL_CITAS}/exportar-csv?${params}`, { headers: authHeaders });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Error al exportar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `citas${exportFecha ? "_" + exportFecha : ""}.csv`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast.success("CSV exportado correctamente");
    } catch (err: any) { toast.error("Error al exportar CSV", err?.message); }
  };

  const getMensajeColor = (tipo: string) => {
    switch (tipo) {
      case "warning": return "var(--warning-50)";
      case "error": return "var(--danger-50)";
      default: return "var(--info-50)";
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>📋 Agenda de Citas</h2>
        <p>Consulte y programe citas médicas</p>
      </div>

      <div className="tab-container">
        <div className="tab-buttons" style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button 
            className={`tab-btn ${mostrandoListado ? "active" : ""}`} 
            onClick={() => setMostrandoListado(true)}
            style={{
              padding: "10px 24px",
              borderRadius: "30px",
              border: "none",
              background: mostrandoListado ? "var(--primary-500)" : "var(--slate-100)",
              color: mostrandoListado ? "white" : "var(--text-secondary)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            📅 Consultar Citas
          </button>
          {puedeEditar && (
            <button 
              className={`tab-btn ${!mostrandoListado ? "active" : ""}`} 
              onClick={() => setMostrandoListado(false)}
              style={{
                padding: "10px 24px",
                borderRadius: "30px",
                border: "none",
                background: !mostrandoListado ? "var(--primary-500)" : "var(--slate-100)",
                color: !mostrandoListado ? "white" : "var(--text-secondary)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              ➕ Nueva Cita
            </button>
          )}
        </div>
      </div>

      {mostrandoListado ? (
        <Card title="📋 Listado de Citas" variant="elevated">
          <div className="result-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <small>{totalResultados} cita(s) encontrada(s)</small>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <select value={exportMedicoId} onChange={e => setExportMedicoId(e.target.value)} className="date-input" style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <option value="">Médico (opcional)</option>
                {medicosUnicos.map((m: any) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
              <input type="date" value={exportFecha} onChange={e => setExportFecha(e.target.value)} className="date-input" style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)" }} />
              <Button variant="secondary" size="sm" onClick={exportarCsv}>📥 Exportar CSV</Button>
              <Button variant="ghost" size="sm" onClick={() => { setOrden(o => o === "asc" ? "desc" : "asc"); setPage(1); }}>
                Orden {orden === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>
          <div className="filter-bar" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <select value={filtroMedicoId} onChange={e => setFiltroMedicoId(e.target.value)} className="date-input" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <option value="">Todos los médicos</option>
                {medicosUnicos.map((m: any) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} className="date-input" style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
            <Button variant="primary" size="sm" onClick={() => { setAppliedMedicoId(filtroMedicoId); setAppliedFecha(filtroFecha); setPage(1); }}>🔍 Buscar</Button>
            <Button variant="secondary" size="sm" onClick={() => { setFiltroMedicoId(""); setFiltroFecha(""); setAppliedMedicoId(""); setAppliedFecha(""); setPage(1); }}>🗑️ Limpiar</Button>
          </div>

          {cargandoCitas ? <Spinner text="Cargando citas..." /> : citas.length === 0 ? (
            <div className="empty-state" style={{ textAlign: "center", padding: "60px 20px" }}>
              <Calendar size={48} style={{ marginBottom: "16px", color: "var(--text-muted)" }} />
              <p>No hay citas para los filtros seleccionados</p>
              <small>Intenta con otros filtros o crea una nueva cita</small>
            </div>
          ) : (
            <>
              <div className="table-wrapper" style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "var(--slate-50)" }}>
                    <tr>
                      <th style={{ padding: "12px", textAlign: "left" }}>Paciente</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Médico</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Fecha</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Hora</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Motivo</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.map(cita => {
                      const pac = pacientes.find(p => p.id === cita.pacienteId);
                      const med = medicos.find(m => m.id === cita.medicoId);
                      return (
                        <tr key={cita.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px" }}>{cita.paciente ? `${cita.paciente.nombres} ${cita.paciente.apellidos}` : pac ? `${pac.nombres} ${pac.apellidos}` : "—"}</td>
                          <td style={{ padding: "12px" }}>{cita.medico?.nombre || med?.nombre || "—"}</td>
                          <td style={{ padding: "12px" }}>{cita.fecha}</td>
                          <td style={{ padding: "12px" }}><strong>{cita.hora}</strong></td>
                          <td style={{ padding: "12px" }}>
                            <span className={`badge ${cita.estado === "AGENDADA" ? "badge-warning" : cita.estado === "CANCELADA" ? "badge-danger" : "badge-success"}`}>{cita.estado}</span>
                          </td>
                          <td style={{ padding: "12px", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cita.descripcion || "—"}</td>
                          <td className="actions-cell" style={{ padding: "12px", display: "flex", gap: "8px" }}>
                            <Button variant="secondary" size="sm" onClick={() => abrirModalReagendar(cita)}>🔄 Reagendar</Button>
                            <Button variant="info" size="sm" onClick={() => verHistorial(cita.id)}>📜 Historial</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px" }}>
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</Button>
                <span className="page-info">Página {page} de {totalPages}</span>
                <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente →</Button>
              </div>
            </>
          )}
        </Card>
      ) : (
        <div>
          <Card title="📅 Datos de la Cita" variant="elevated">
            <div className="form-row" style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div className={`form-group ${errFecha ? "input-error" : ""}`} style={{ flex: 1 }}>
                <label className="input-label">📅 Fecha <span className="input-required">*</span></label>
                <input type="date" value={fecha} min={new Date().toISOString().split("T")[0]}
                  onChange={e => { setFecha(e.target.value); setErrFecha(""); setHora(""); }}
                  className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
                {errFecha && <span className="input-error-message">{errFecha}</span>}
              </div>
              <div className={`form-group ${errMedico ? "input-error" : ""}`} style={{ flex: 1 }}>
                <label className="input-label">👨‍⚕️ Especialista <span className="input-required">*</span></label>
                <select value={medicoId} onChange={e => { setMedicoId(e.target.value); setErrMedico(""); setHora(""); }} className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <option value="">Seleccionar especialista</option>
                  {medicosUnicos.map((m: any) => <option key={m.id} value={m.id}>{m.nombre} — {m.especialidad}</option>)}
                </select>
                {errMedico && <span className="input-error-message">{errMedico}</span>}
              </div>
            </div>
            
            {/* Mensaje amigable cuando no hay horarios */}
            {mensajeHorario && (
              <div style={{ 
                background: getMensajeColor(mensajeHorario.tipo), 
                padding: "12px 16px", 
                borderRadius: "8px", 
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: `1px solid ${mensajeHorario.tipo === "warning" ? "var(--warning-200)" : mensajeHorario.tipo === "error" ? "var(--danger-200)" : "var(--info-200)"}`
              }}>
                {mensajeHorario.tipo === "warning" && <AlertCircle size={18} color="var(--warning-600)" />}
                {mensajeHorario.tipo === "info" && <Clock size={18} color="var(--info-600)" />}
                {mensajeHorario.tipo === "error" && <AlertCircle size={18} color="var(--danger-600)" />}
                <span style={{ fontSize: "0.85rem" }}>{mensajeHorario.texto}</span>
              </div>
            )}
            
            <div className={`form-group ${errHora ? "input-error" : ""}`}>
              <label className="input-label">⏰ Hora <span className="input-required">*</span></label>
              {cargandoHoras ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spinner size="sm" />
                  <span style={{ marginLeft: "8px" }}>Cargando horarios...</span>
                </div>
              ) : (
                <select 
                  value={hora} 
                  onChange={e => { setHora(e.target.value); setErrHora(""); }}
                  disabled={horasDelTurno.length === 0 || horasDisponibles.length === 0} 
                  className="input-field" 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}
                >
                  <option value="">
                    {horasDelTurno.length === 0 
                      ? "Seleccione médico y fecha primero" 
                      : horasDisponibles.length === 0 
                        ? "No hay horarios disponibles para esta fecha" 
                        : "Seleccionar hora"}
                  </option>
                  {horasDelTurno.map(h => { 
                    const ocupada = !horasDisponibles.includes(h); 
                    return (
                      <option key={h} value={h} disabled={ocupada} style={{ color: ocupada ? "var(--text-muted)" : "inherit" }}>
                        {h} {ocupada ? "(ocupada)" : "(disponible)"}
                      </option>
                    );
                  })}
                </select>
              )}
              {errHora && <span className="input-error-message">{errHora}</span>}
            </div>
          </Card>

          <Card title="👤 Paciente" variant="elevated">
            <div className="form-row" style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "16px" }}>
              <div className={`form-group ${errDoc ? "input-error" : ""}`} style={{ flex: 3, marginBottom: 0 }}>
                <label className="input-label">📄 Número de documento <span className="input-required">*</span></label>
                <input 
                  className="input-field" 
                  value={docBusqueda}
                  onChange={e => { setDocBusqueda(e.target.value); setErrDoc(""); setPacienteExistente(null); setPacienteId(""); setMostrarFormPaciente(false); }}
                  placeholder="Ej: 1234567890"
                  onKeyDown={e => e.key === "Enter" && buscarPaciente()} 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}
                />
                {errDoc && <span className="input-error-message">{errDoc}</span>}
              </div>
              <Button variant="secondary" onClick={buscarPaciente} loading={buscandoPaciente} style={{ flex: 1, marginBottom: "16px", height: "42px" }}>
                <Search size={16} /> Buscar
              </Button>
            </div>
            {errPaciente && <span className="input-error-message" style={{ display: "block", marginBottom: "8px" }}>{errPaciente}</span>}

            {pacienteExistente && (
              <div className="search-found" style={{ 
                background: "var(--success-50)", 
                padding: "12px 16px", 
                borderRadius: "8px", 
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <CheckCircle2 size={18} color="var(--success-600)" />
                <span><strong>{pacienteExistente.nombres} {pacienteExistente.apellidos}</strong> · Doc: {pacienteExistente.documento} · Cel: {pacienteExistente.celular}</span>
              </div>
            )}

            {mostrarFormPaciente && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "8px" }}>
                <p className="form-section-title" style={{ fontWeight: 600, marginBottom: "12px" }}><UserPlus size={16} /> Paciente no encontrado — registrar nuevo</p>
                <div className="form-row" style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                  <Input label="Nombres" required value={nuevoPaciente.nombres} onChange={e => setNuevoPaciente(p => ({ ...p, nombres: e.target.value }))} error={erroresPaciente.nombres} />
                  <Input label="Apellidos" required value={nuevoPaciente.apellidos} onChange={e => setNuevoPaciente(p => ({ ...p, apellidos: e.target.value }))} error={erroresPaciente.apellidos} />
                </div>
                <div className="form-row" style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                  <Input label="Celular" required value={nuevoPaciente.celular}
                    onChange={e => setNuevoPaciente(p => ({ ...p, celular: e.target.value.replace(/\D/g, "") }))}
                    error={erroresPaciente.celular} helperText="Solo dígitos (7-15)" />
                  <div className="form-group">
                    <label className="input-label">Género</label>
                    <select value={nuevoPaciente.genero} onChange={e => setNuevoPaciente(p => ({ ...p, genero: e.target.value as Genero }))} className="input-field">
                      <option value="Hombre">Hombre</option><option value="Mujer">Mujer</option><option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
                <div className="form-row" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                  <Input type="date" label="Fecha nacimiento" value={nuevoPaciente.fechaNacimiento}
                    onChange={e => setNuevoPaciente(p => ({ ...p, fechaNacimiento: e.target.value }))}
                    max={new Date().toISOString().split("T")[0]} />
                  <Input type="email" label="Correo electrónico" value={nuevoPaciente.email}
                    onChange={e => setNuevoPaciente(p => ({ ...p, email: e.target.value }))} error={erroresPaciente.email} />
                </div>
                <Button variant="outline" onClick={registrarNuevoPaciente} loading={registrandoPaciente} style={{ width: "100%" }}>📝 Registrar paciente</Button>
              </div>
            )}
          </Card>

          <Card variant="elevated">
            <Input label="📝 Motivo de consulta" placeholder="Describa el motivo (opcional)" value={descripcion}
              onChange={e => setDescripcion(e.target.value)} />
            <Button variant="primary" fullWidth onClick={crear} loading={creando}
              disabled={!fecha || !hora || !medicoId || !pacienteId}
              style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", fontWeight: 600 }}>
              ✅ Agendar Cita
            </Button>
          </Card>
        </div>
      )}

      {/* Modal de código QR */}
      <Modal isOpen={mostrarModalCodigo} onClose={cerrarModalCodigo} title="Código de verificación" size="md">
        <div style={{ textAlign: "center", display: "grid", gap: "18px", padding: "10px 0" }}>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            Copia el código y descarga el QR para presentarlo en tu cita.
          </p>
          <div style={{ display: "grid", gap: "10px", justifyItems: "center" }}>
            <div style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--primary-800)" }}>
              {codigoVerificacion}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              <button className="btn btn-secondary btn-md" type="button" onClick={copiarCodigoVerificacion}>
                Copiar código
              </button>
              <button className="btn btn-primary btn-md" type="button" onClick={descargarCodigoQR}>
                Descargar QR como imagen
              </button>
            </div>
          </div>
          <div style={{ padding: "16px", background: "white", borderRadius: "18px", boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}>
            <QRCodeCanvas id="codigo-verificacion-qr" value={codigoVerificacion} size={240} bgColor="#ffffff" fgColor="#111827" level="H" />
          </div>
        </div>
      </Modal>

      {/* Modal de reagendar */}
      <Modal isOpen={mostrarModalReagendar} onClose={() => setMostrarModalReagendar(false)} title="Reagendar Cita" size="md">
        <p style={{ marginBottom: "12px" }}>
          <strong>Paciente:</strong> {citaSeleccionada?.paciente?.nombres ?? "—"} {citaSeleccionada?.paciente?.apellidos ?? ""}<br />
          <strong>Médico:</strong> {citaSeleccionada?.medico?.nombre ?? "—"}<br />
          <strong>Fecha actual:</strong> {citaSeleccionada?.fecha} a las {citaSeleccionada?.hora}
        </p>
        <div className={`form-group ${errReagFecha ? "input-error" : ""}`}>
          <label className="input-label">Nueva fecha <span className="input-required">*</span></label>
          <input type="date" value={nuevaFechaReag} min={new Date().toISOString().split("T")[0]}
            onChange={e => { setNuevaFechaReag(e.target.value); setErrReagFecha(""); }} className="input-field" />
          {errReagFecha && <span className="input-error-message">{errReagFecha}</span>}
        </div>
        <div className={`form-group ${errReagHora ? "input-error" : ""}`}>
          <label className="input-label">Nueva hora <span className="input-required">*</span></label>
          <select value={nuevaHoraReag} onChange={e => { setNuevaHoraReag(e.target.value); setErrReagHora(""); }}
            disabled={cargandoHorasReag} className="input-field">
            <option value="">Seleccione hora</option>
            {horasDisponiblesReag.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          {cargandoHorasReag && <span className="input-helper">Cargando horarios disponibles...</span>}
          {errReagHora && <span className="input-error-message">{errReagHora}</span>}
        </div>
        <div className="modal-buttons" style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "20px" }}>
          <Button variant="primary" onClick={reagendarCita} loading={cargandoReagendar}>Guardar cambios</Button>
          <Button variant="secondary" onClick={() => setMostrarModalReagendar(false)}>Cancelar</Button>
        </div>
      </Modal>

      {/* Modal de historial */}
      <Modal isOpen={mostrarModalHistorial} onClose={() => setMostrarModalHistorial(false)} title="Historial de cambios" size="lg">
        {cargandoHistorial ? <Spinner text="Cargando historial..." /> : historial.length === 0 ? (
          <p>No hay cambios registrados para esta cita.</p>
        ) : (
          <div className="table-wrapper" style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "var(--slate-50)" }}>
                <tr>
                  <th style={{ padding: "12px" }}>Campo</th>
                  <th style={{ padding: "12px" }}>Valor anterior</th>
                  <th style={{ padding: "12px" }}>Valor nuevo</th>
                  <th style={{ padding: "12px" }}>Modificado por</th>
                  <th style={{ padding: "12px" }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(h => (
                  <tr key={h.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px" }}>{h.campo}</td>
                    <td style={{ padding: "12px" }}>{h.valorAnterior}</td>
                    <td style={{ padding: "12px" }}>{h.valorNuevo}</td>
                    <td style={{ padding: "12px" }}>{h.modificadoPor}</td>
                    <td style={{ padding: "12px" }}>{new Date(h.createdAt).toLocaleString("es-CO")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default Citas;