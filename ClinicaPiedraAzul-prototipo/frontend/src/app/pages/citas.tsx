import { useEffect, useState } from "react";
import { getCitas, crearCita, getHorasDisponibles } from "../services/citas.service";
import { getPacientes, buscarPacientePorDocumento, crearPaciente } from "../services/pacientes.service";
import { getMedicos } from "../services/medicos.service";
import { getAuthHeaders } from "../../auth/authService";

type Genero = "Hombre" | "Mujer" | "Otro";

function Citas() {
  // ========== ESTADOS GENERALES ==========
  const [citas, setCitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [mostrandoListado, setMostrandoListado] = useState(true);
  
  // Paginación local
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orden, setOrden] = useState<"asc" | "desc">("asc");
  const limit = 10;

  // ========== ESTADOS PARA CREAR CITA ==========
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [horasDelTurno, setHorasDelTurno] = useState<string[]>([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    documento: "",
    nombres: "",
    apellidos: "",
    celular: "",
    genero: "Otro" as Genero,
    fechaNacimiento: "",
    email: "",
  });
  const [mostrarFormPaciente, setMostrarFormPaciente] = useState(false);
  const [pacienteExistente, setPacienteExistente] = useState<any>(null);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);

  // ========== ESTADOS PARA REAGENDAR ==========
  const [citaSeleccionada, setCitaSeleccionada] = useState<any>(null);
  const [mostrarModalReagendar, setMostrarModalReagendar] = useState(false);
  const [nuevaFechaReag, setNuevaFechaReag] = useState("");
  const [nuevaHoraReag, setNuevaHoraReag] = useState("");
  const [cargandoReagendar, setCargandoReagendar] = useState(false);
  const [horasDisponiblesReag, setHorasDisponiblesReag] = useState<string[]>([]);
  const [cargandoHorasReag, setCargandoHorasReag] = useState(false);

  // ========== ESTADOS PARA HISTORIAL ==========
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [exportMedicoId, setExportMedicoId] = useState("");
  const [exportFecha, setExportFecha] = useState("");

  // ========== CARGAR DATOS INICIALES ==========
  const cargarTodo = async () => {
    const [citasData, pacientesData, medicosData] = await Promise.all([
      getCitas(),
      getPacientes(),
      getMedicos(),
    ]);
    const normalizeList = (data: any) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    };
    setCitas(normalizeList(citasData));
    setPacientes(normalizeList(pacientesData));
    setMedicos(normalizeList(medicosData));
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  // ========== PAGINACIÓN Y ORDEN LOCAL ==========
  const getCitasPaginadas = () => {
    if (!Array.isArray(citas)) {
      return [];
    }
    let citasOrdenadas = [...citas];
    citasOrdenadas.sort((a, b) => {
      const compareFecha = orden === "asc"
        ? a.fecha.localeCompare(b.fecha)
        : b.fecha.localeCompare(a.fecha);
      if (compareFecha !== 0) return compareFecha;
      return orden === "asc"
        ? a.hora.localeCompare(b.hora)
        : b.hora.localeCompare(a.hora);
    });
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginadas = citasOrdenadas.slice(start, end);
    const total = citasOrdenadas.length;
    const totalPag = Math.ceil(total / limit);
    if (totalPages !== totalPag) setTotalPages(totalPag);
    return paginadas;
  };

  const cambiarPagina = (nueva: number) => setPage(nueva);
  const cambiarOrden = () => {
    setOrden(orden === "asc" ? "desc" : "asc");
    setPage(1);
  };

  const citasMostrar = getCitasPaginadas();

  // ========== FUNCIONES PARA CREAR CITA ==========
  const buscarPaciente = async (documento: string) => {
    if (!documento || documento.length < 5) return;
    setBuscandoPaciente(true);
    const paciente = await buscarPacientePorDocumento(documento);
    if (paciente) {
      setPacienteExistente(paciente);
      setPacienteId(paciente.id.toString());
      setMostrarFormPaciente(false);
    } else {
      setPacienteExistente(null);
      setMostrarFormPaciente(true);
    }
    setBuscandoPaciente(false);
  };

  const registrarNuevoPaciente = async () => {
    if (!nuevoPaciente.documento || !nuevoPaciente.nombres || !nuevoPaciente.apellidos || !nuevoPaciente.celular) {
      alert("Complete los campos obligatorios del paciente");
      return;
    }
    const nuevo = await crearPaciente(nuevoPaciente);
    setPacienteId(nuevo.id.toString());
    setMostrarFormPaciente(false);
    setPacienteExistente(nuevo);
    cargarTodo();
  };

  const crear = async () => {
    if (!fecha || !hora || !pacienteId || !medicoId) {
      alert("Complete todos los campos");
      return;
    }
    try {
      await crearCita({
        fecha,
        hora,
        pacienteId: Number(pacienteId),
        medicoId: Number(medicoId),
        descripcion,
        estado: "AGENDADA",
      });
    } catch (error: any) {
      alert(error?.message || "No se pudo agendar");
      return;
    }
    setFecha("");
    setHora("");
    setPacienteId("");
    setMedicoId("");
    setDescripcion("");
    setNuevoPaciente({
      documento: "",
      nombres: "",
      apellidos: "",
      celular: "",
      genero: "Otro",
      fechaNacimiento: "",
      email: "",
    });
    setPacienteExistente(null);
    setMostrarFormPaciente(false);
    alert("Cita agendada");
    cargarTodo();
  };

  // ========== HORAS DISPONIBLES (para crear cita) ==========
  useEffect(() => {
    if (medicoId && fecha) {
      const cargarHoras = async () => {
        const horas = await getHorasDisponibles(Number(medicoId), fecha);
        setHorasDisponibles(horas);
        const medicoSel = medicos.find((m: any) => m.id === Number(medicoId));
        const config = medicoSel?.configuracion;
        if (!config) {
          setHorasDelTurno([]);
          return;
        }
        const diasAtencion: string[] = Array.isArray(config.diasAtencion) ? config.diasAtencion : [];
        const normalizar = (valor: string) =>
          valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
        const [anio, mes, dia] = fecha.split("-").map(Number);
        const fechaLocal = new Date(anio, mes - 1, dia);
        const diasSemana = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
        const diaSeleccionado = diasSemana[fechaLocal.getDay()];
        const atiende = diasAtencion.map((d) => normalizar(d)).includes(normalizar(diaSeleccionado));
        if (!atiende) {
          setHorasDelTurno([]);
          return;
        }
        const [inicioH, inicioM] = (config.horaInicio || "08:00").split(":").map(Number);
        const [finH, finM] = (config.horaFin || "17:00").split(":").map(Number);
        const intervalo = Number(config.intervaloMinutos) || 30;
        let horaActual = inicioH * 60 + inicioM;
        const finTotal = finH * 60 + finM;
        const todas: string[] = [];
        while (horaActual < finTotal) {
          const h = Math.floor(horaActual / 60);
          const m = horaActual % 60;
          todas.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
          horaActual += intervalo;
        }
        setHorasDelTurno(todas);
      };
      cargarHoras();
    } else {
      setHorasDisponibles([]);
      setHorasDelTurno([]);
    }
  }, [medicoId, fecha, medicos]);

  useEffect(() => {
    if (hora && !horasDisponibles.includes(hora)) setHora("");
  }, [hora, horasDisponibles]);

  const horasOcupadas = horasDelTurno.filter((h) => !horasDisponibles.includes(h));
  const totalHoras = horasDelTurno.length;
  const totalDisponibles = horasDisponibles.length;
  const totalOcupadas = horasOcupadas.length;
  const medicosUnicos = Array.from(
    new Map(medicos.map((m: any) => [m.id, m])).values(),
  );

  // ========== FUNCIONES PARA REAGENDAR ==========
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
      const res = await fetch(`http://localhost:3000/citas/${citaSeleccionada.id}/reagendar`, {
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
      cargarTodo();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCargandoReagendar(false);
    }
  };

  // ========== FUNCIONES PARA HISTORIAL ==========
  const verHistorial = async (citaId: number) => {
    setMostrarModalHistorial(true);
    setCargandoHistorial(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`http://localhost:3000/citas/${citaId}/historial`, {
        headers: authHeaders,
      });
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

  const exportarCsv = async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const params = new URLSearchParams();
      if (exportMedicoId) params.set("medicoId", exportMedicoId);
      if (exportFecha) params.set("fecha", exportFecha);
      const res = await fetch(`http://localhost:3000/citas/exportar-csv?${params.toString()}`, {
        headers: authHeaders,
      });
      if (!res.ok) {
        let mensaje = "Error al exportar CSV";
        try {
          const error = await res.json();
          if (typeof error?.message === "string") mensaje = error.message;
        } catch {
          // Sin cuerpo JSON.
        }
        throw new Error(mensaje);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const nombrePartes = [
        "citas",
        exportMedicoId ? `medico_${exportMedicoId}` : null,
        exportFecha || null,
      ].filter(Boolean);
      anchor.href = url;
      anchor.download = `${nombrePartes.join("_")}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error?.message || "Error al exportar CSV");
    }
  };

  // ========== RENDER ==========
  return (
    <div>
      <div className="page-header">
        <h2>Agenda de Citas</h2>
        <p>Consulte y programe sus citas médicas</p>
      </div>

      <div className="tab-container">
        <div className="tab-buttons">
          <button className={`tab-btn ${mostrandoListado ? "active" : ""}`} onClick={() => setMostrandoListado(true)}>
            Consultar Citas
          </button>
          <button className={`tab-btn ${!mostrandoListado ? "active" : ""}`} onClick={() => setMostrandoListado(false)}>
            Nueva Cita
          </button>
        </div>
      </div>

      {mostrandoListado ? (
        <div className="card-custom">
          <div className="result-header">
            <h4>Listado de Citas</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select
                value={exportMedicoId}
                onChange={(e) => setExportMedicoId(e.target.value)}
                className="date-input"
              >
                <option value="">Medico (opcional)</option>
                {medicosUnicos.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={exportFecha}
                onChange={(e) => setExportFecha(e.target.value)}
                className="date-input"
              />
              <button className="btn btn-secondary" onClick={exportarCsv}>
                Exportar CSV
              </button>
              <button className="btn btn-secondary" onClick={cambiarOrden}>
                Ordenar {orden === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
          {citasMostrar.length === 0 ? (
            <div className="empty-state"><p>No hay citas</p></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Paciente</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Motivo</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {citasMostrar.map((cita) => {
                      const paciente = pacientes.find((p) => p.id === cita.pacienteId);
                      return (
                        <tr key={cita.id}>
                          <td>{paciente?.nombres} {paciente?.apellidos}</td>
                          <td>{cita.fecha}</td>
                          <td>{cita.hora}</td>
                          <td><span className={`badge ${cita.estado === "AGENDADA" ? "badge-warning" : "badge-success"}`}>{cita.estado === "AGENDADA" ? "Programada" : "Confirmada"}</span></td>
                          <td>{cita.descripcion || "---"}</td>
                          <td>
                            <button className="btn btn-secondary btn-sm" style={{ marginRight: 8 }} onClick={() => abrirModalReagendar(cita)}>Reagendar</button>
                            <button className="btn btn-info btn-sm" onClick={() => verHistorial(cita.id)}>Historial</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
                <button className="btn btn-secondary" disabled={page === 1} onClick={() => cambiarPagina(page - 1)}>Anterior</button>
                <span>Página {page} de {totalPages}</span>
                <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => cambiarPagina(page + 1)}>Siguiente</button>
              </div>
            </>
          )}
        </div>
      ) : (
        // ===== FORMULARIO DE NUEVA CITA =====
        <div>
          <div className="card-custom">
            <h4>Datos de la Cita</h4>
            <div className="form-group"><label>Fecha</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
            <div className="form-group">
              <label>Hora</label>
              <select value={hora} onChange={(e) => setHora(e.target.value)} disabled={horasDelTurno.length === 0}>
                <option value="">Seleccionar hora</option>
                {horasDelTurno.map((h) => {
                  const ocupada = !horasDisponibles.includes(h);
                  return <option key={h} value={h} disabled={ocupada}>{ocupada ? `${h} (ocupada)` : h}</option>;
                })}
              </select>
              {medicoId && fecha && totalHoras > 0 && (
                <div className="horario-info-banner">
                  <div className="horario-info-icon">🕒</div>
                  <div className="horario-info-content">
                    <p className="horario-info-title">Horarios del día</p>
                    <p className="horario-info-text">Disponibles: <strong>{totalDisponibles}</strong> · Ocupadas: <strong>{totalOcupadas}</strong></p>
                    {totalOcupadas > 0 && <p className="horario-info-note">Las horas ocupadas aparecen en gris y no se pueden seleccionar.</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Especialista</label>
              <select value={medicoId} onChange={(e) => setMedicoId(e.target.value)}>
                <option value="">Seleccionar especialista</option>
                {medicosUnicos.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} - {m.especialidad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-custom">
            <h4>Información del Paciente</h4>
            <div className="form-group">
              <label>Número de documento</label>
              <input type="text" placeholder="Documento de identidad" value={nuevoPaciente.documento} onChange={(e) => { setNuevoPaciente({...nuevoPaciente, documento: e.target.value}); buscarPaciente(e.target.value); }} />
            </div>
            {buscandoPaciente && <div className="loading-spinner">Buscando...</div>}
            {pacienteExistente && <div className="success-message"><span>✓</span><p>{pacienteExistente.nombres} {pacienteExistente.apellidos} - {pacienteExistente.celular}</p></div>}
            {mostrarFormPaciente && nuevoPaciente.documento && (
              <div className="new-patient-form">
                <div className="form-row">
                  <div className="form-group"><label>Nombres</label><input type="text" value={nuevoPaciente.nombres} onChange={e => setNuevoPaciente({...nuevoPaciente, nombres: e.target.value})} /></div>
                  <div className="form-group"><label>Apellidos</label><input type="text" value={nuevoPaciente.apellidos} onChange={e => setNuevoPaciente({...nuevoPaciente, apellidos: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Celular</label><input type="tel" value={nuevoPaciente.celular} onChange={e => setNuevoPaciente({...nuevoPaciente, celular: e.target.value})} /></div>
                  <div className="form-group"><label>Género</label><select value={nuevoPaciente.genero} onChange={e => setNuevoPaciente({...nuevoPaciente, genero: e.target.value as Genero})}><option value="Hombre">Hombre</option><option value="Mujer">Mujer</option><option value="Otro">Otro</option></select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Fecha de nacimiento</label><input type="date" value={nuevoPaciente.fechaNacimiento} onChange={e => setNuevoPaciente({...nuevoPaciente, fechaNacimiento: e.target.value})} /></div>
                  <div className="form-group"><label>Correo electrónico</label><input type="email" value={nuevoPaciente.email} onChange={e => setNuevoPaciente({...nuevoPaciente, email: e.target.value})} /></div>
                </div>
                <button className="btn btn-primary" onClick={registrarNuevoPaciente}>Registrar Paciente</button>
              </div>
            )}
          </div>

          <div className="card-custom">
            <div className="form-group"><label>Motivo de consulta</label><input placeholder="Describa el motivo" value={descripcion} onChange={e => setDescripcion(e.target.value)} /></div>
            <button className="btn btn-primary btn-block" onClick={crear} disabled={!fecha || !hora || !medicoId || !pacienteId}>Agendar Cita</button>
          </div>
        </div>
      )}

      {/* Modal Reagendar */}
      {mostrarModalReagendar && citaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reagendar Cita</h3>
            <p><strong>Paciente:</strong> {citaSeleccionada.paciente?.nombres} {citaSeleccionada.paciente?.apellidos}</p>
            <p><strong>Médico:</strong> {citaSeleccionada.medico?.nombre}</p>
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
              <button className="btn btn-primary" onClick={reagendarCita} disabled={cargandoReagendar}>{cargandoReagendar ? "Guardando..." : "Guardar cambios"}</button>
              <button className="btn btn-secondary" onClick={() => setMostrarModalReagendar(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial */}
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

export default Citas;