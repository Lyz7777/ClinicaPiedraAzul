import { useEffect, useState } from "react";
import { getCitas, crearCita, getHorasDisponibles } from "../services/citas.service";
import { buscarPacientePorDocumento, crearPaciente } from "../services/pacientes.service";
import { getMedicos } from "../services/medicos.service";
import { getAuthHeaders } from "../../auth/authService";
import { Button, Card, Modal, Spinner, useToast } from "../../components/UI";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, Calendar, Search, UserPlus, Trash2 } from "lucide-react";

type Genero = "Hombre" | "Mujer" | "Otro";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const URL_CITAS = `${API_URL}/citas`;

interface CitasProps {
  rol?: "admin" | "agendador" | "paciente" | "medico";
}

function Citas({ rol = "agendador" }: CitasProps) {
  const toast = useToast();
  const puedeEditar = rol === "admin" || rol === "agendador";

  // Estados para listado de citas
  const [citas, setCitas] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);
  const [filtroMedicoId, setFiltroMedicoId] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [mostrandoListado, setMostrandoListado] = useState(true);

  // Estados para nueva cita
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [creando, setCreando] = useState(false);
  const [codigoVerificacion, setCodigoVerificacion] = useState("");
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);

  // Estados para paciente
  const [docBusqueda, setDocBusqueda] = useState("");
  const [pacienteExistente, setPacienteExistente] = useState<any>(null);
  const [mostrarFormPaciente, setMostrarFormPaciente] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    documento: "",
    nombres: "",
    apellidos: "",
    celular: "",
    genero: "Otro" as Genero,
    fechaNacimiento: "",
    email: ""
  });
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [registrandoPaciente, setRegistrandoPaciente] = useState(false);
  const [pacienteId, setPacienteId] = useState("");

  // Estados para reagendar
  const [citaSeleccionada, setCitaSeleccionada] = useState<any>(null);
  const [mostrarModalReagendar, setMostrarModalReagendar] = useState(false);
  const [nuevaFechaReag, setNuevaFechaReag] = useState("");
  const [nuevaHoraReag, setNuevaHoraReag] = useState("");
  const [cargandoReagendar, setCargandoReagendar] = useState(false);
  const [horasDisponiblesReag, setHorasDisponiblesReag] = useState<string[]>([]);
  const [cargandoHorasReag, setCargandoHorasReag] = useState(false);

  // Estados para historial
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Estado para cancelar
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  const normalizeList = (data: any) => Array.isArray(data) ? data : data?.data || [];

  const cargarMedicos = async () => {
    try {
      const data = await getMedicos();
      setMedicos(normalizeList(data));
    } catch (error) {
      console.error("Error cargando médicos:", error);
    }
  };

  const cargarCitas = async () => {
    setCargandoCitas(true);
    try {
      const params = new URLSearchParams();
      if (filtroMedicoId) params.set("medicoId", filtroMedicoId);
      if (filtroFecha) params.set("fecha", filtroFecha);
      const url = `${URL_CITAS}${params.toString() ? `?${params}` : ""}`;
      const authHeaders = await getAuthHeaders();
      const res = await fetch(url, { headers: authHeaders });
      const data = await res.json();
      setCitas(normalizeList(data));
    } catch (error) {
      toast.error("Error al cargar citas");
    } finally {
      setCargandoCitas(false);
    }
  };

  useEffect(() => {
    cargarMedicos();
    cargarCitas();
  }, [filtroMedicoId, filtroFecha]);

  const buscarHorasDisponibles = async () => {
    if (!medicoId || !fecha) return;
    setCargandoHoras(true);
    try {
      const horas = await getHorasDisponibles(Number(medicoId), fecha);
      setHorasDisponibles(Array.isArray(horas) ? horas : []);
    } catch (error) {
      setHorasDisponibles([]);
    } finally {
      setCargandoHoras(false);
    }
  };

  useEffect(() => {
    buscarHorasDisponibles();
  }, [medicoId, fecha]);

  useEffect(() => {
    if (citaSeleccionada && nuevaFechaReag) {
      setCargandoHorasReag(true);
      getHorasDisponibles(citaSeleccionada.medicoId, nuevaFechaReag)
        .then(h => setHorasDisponiblesReag(Array.isArray(h) ? h : []))
        .catch(() => setHorasDisponiblesReag([]))
        .finally(() => setCargandoHorasReag(false));
    }
  }, [citaSeleccionada, nuevaFechaReag]);

  const limpiarPaciente = () => {
    setPacienteExistente(null);
    setPacienteId("");
    setMostrarFormPaciente(false);
    setNuevoPaciente({
      documento: "",
      nombres: "",
      apellidos: "",
      celular: "",
      genero: "Otro",
      fechaNacimiento: "",
      email: ""
    });
  };

  const limpiarFormularioCompleto = () => {
    setFecha("");
    setHora("");
    setMedicoId("");
    setDescripcion("");
    setDocBusqueda("");
    limpiarPaciente();
  };

  const buscarPaciente = async () => {
    if (!docBusqueda.trim()) {
      toast.error("Ingrese un documento");
      return;
    }
    
    limpiarPaciente();
    setBuscandoPaciente(true);
    try {
      const paciente = await buscarPacientePorDocumento(docBusqueda.trim());
      
      if (paciente && paciente.id && paciente.nombres && !paciente.nombres.startsWith("auth0_")) {
        setPacienteExistente(paciente);
        setPacienteId(paciente.id.toString());
        setMostrarFormPaciente(false);
        toast.success(`Paciente encontrado: ${paciente.nombres} ${paciente.apellidos}`);
      } else {
        setMostrarFormPaciente(true);
        setNuevoPaciente({
          documento: docBusqueda.trim(),
          nombres: "",
          apellidos: "",
          celular: "",
          genero: "Otro",
          fechaNacimiento: "",
          email: ""
        });
        toast.info("Paciente no encontrado, complete el formulario para registrarlo");
      }
    } catch (error) {
      console.error(error);
      setMostrarFormPaciente(true);
      setNuevoPaciente({
        documento: docBusqueda.trim(),
        nombres: "",
        apellidos: "",
        celular: "",
        genero: "Otro",
        fechaNacimiento: "",
        email: ""
      });
    } finally {
      setBuscandoPaciente(false);
    }
  };

  const registrarPaciente = async () => {
    if (!nuevoPaciente.nombres || !nuevoPaciente.apellidos || !nuevoPaciente.celular) {
      toast.error("Complete todos los campos obligatorios");
      return;
    }
    setRegistrandoPaciente(true);
    try {
      const nuevo = await crearPaciente({
        ...nuevoPaciente,
        auth0Id: undefined
      });
      setPacienteId(nuevo.id.toString());
      setPacienteExistente(nuevo);
      setMostrarFormPaciente(false);
      toast.success("Paciente registrado");
    } catch (error: any) {
      toast.error("Error al registrar", error.message);
    } finally {
      setRegistrandoPaciente(false);
    }
  };

  const agendarCita = async () => {
    if (!fecha || !hora || !medicoId || !pacienteId) {
      toast.error("Complete todos los datos de la cita");
      return;
    }
    setCreando(true);
    try {
      const nuevaCita = await crearCita({
        fecha,
        hora,
        pacienteId: Number(pacienteId),
        medicoId: Number(medicoId),
        descripcion,
        estado: "AGENDADA"
      });
      
      toast.success("Cita agendada exitosamente");
      
      if (nuevaCita?.codigoVerificacion) {
        setCodigoVerificacion(nuevaCita.codigoVerificacion);
        setMostrarModalCodigo(true);
      }
      
      limpiarFormularioCompleto();
      cargarCitas();
    } catch (error: any) {
      console.error("Error al agendar:", error);
      toast.error("Error al agendar", error.message);
    } finally {
      setCreando(false);
    }
  };

  const reagendarCita = async () => {
    if (!citaSeleccionada || !nuevaFechaReag || !nuevaHoraReag) return;
    setCargandoReagendar(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaSeleccionada.id}/reagendar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ fecha: nuevaFechaReag, hora: nuevaHoraReag })
      });
      if (!res.ok) throw new Error("Error al reagendar");
      toast.success("Cita reagendada");
      setMostrarModalReagendar(false);
      cargarCitas();
    } catch (error: any) {
      toast.error("Error", error.message);
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
      setHistorial(await res.json());
    } catch (error) {
      toast.error("Error al cargar historial");
    } finally {
      setCargandoHistorial(false);
    }
  };

  const cancelarCita = async (citaId: number) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    setCancelandoId(citaId);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${URL_CITAS}/${citaId}/cancelar`, { method: "PATCH", headers: authHeaders });
      if (!res.ok) throw new Error();
      toast.success("Cita cancelada");
      cargarCitas();
    } catch (error) {
      toast.error("Error al cancelar");
    } finally {
      setCancelandoId(null);
    }
  };

  const copiarCodigo = async () => {
    if (codigoVerificacion) {
      await navigator.clipboard.writeText(codigoVerificacion);
      toast.success("Código copiado");
    }
  };

  const descargarQR = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `qr-${codigoVerificacion}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>📋 Agenda de Citas</h2>
        <p>Consulte y programe citas médicas</p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          className={`btn ${mostrandoListado ? "btn-primary" : "btn-secondary"}`}
          onClick={() => {
            setMostrandoListado(true);
            limpiarFormularioCompleto();
          }}
        >
          📅 Consultar Citas
        </button>
        {puedeEditar && (
          <button
            className={`btn ${!mostrandoListado ? "btn-primary" : "btn-secondary"}`}
            onClick={() => {
              setMostrandoListado(false);
              limpiarFormularioCompleto();
            }}
          >
            ➕ Nueva Cita
          </button>
        )}
      </div>

      {mostrandoListado ? (
        <Card>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            {(rol === "admin" || rol === "agendador") && (
              <select
                className="input-field"
                value={filtroMedicoId}
                onChange={(e) => setFiltroMedicoId(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="">Todos los médicos</option>
                {medicos.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            )}
            <input
              type="date"
              className="input-field"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
            <Button onClick={cargarCitas}>🔍 Buscar</Button>
            <Button
              variant="secondary"
              onClick={() => { setFiltroMedicoId(""); setFiltroFecha(""); }}
            >
              🗑️ Limpiar
            </Button>
          </div>

          {cargandoCitas ? (
            <Spinner />
          ) : citas.length === 0 ? (
            <div className="empty-state"><p>No hay citas</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita) => (
                    <tr key={cita.id}>
                      <td>{cita.fecha}</td>
                      <td>{cita.hora}</td>
                      <td>{cita.paciente?.nombres} {cita.paciente?.apellidos}</td>
                      <td>{cita.medico?.nombre}</td>
                      <td><span className="badge badge-warning">{cita.estado}</span></td>
                      <td style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {puedeEditar && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setCitaSeleccionada(cita);
                              setNuevaFechaReag(cita.fecha);
                              setNuevaHoraReag(cita.hora);
                              setMostrarModalReagendar(true);
                            }}
                          >
                            Reagendar
                          </Button>
                        )}
                        <Button size="sm" variant="info" onClick={() => verHistorial(cita.id)}>
                          Historial
                        </Button>
                        {puedeEditar && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => cancelarCita(cita.id)}
                            loading={cancelandoId === cita.id}
                          >
                            Cancelar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <>
          <Card>
            <h3>📅 Datos de la Cita</h3>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <label>Fecha *</label>
                <input
                  type="date"
                  className="input-field"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Médico *</label>
                <select
                  className="input-field"
                  value={medicoId}
                  onChange={(e) => setMedicoId(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {medicos.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label>Hora *</label>
              {cargandoHoras ? (
                <Spinner size="sm" />
              ) : (
                <select
                  className="input-field"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  disabled={horasDisponibles.length === 0}
                >
                  <option value="">Seleccionar hora</option>
                  {horasDisponibles.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ marginTop: "16px" }}>
              <label>Motivo</label>
              <input
                className="input-field"
                placeholder="Motivo de consulta"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <h3>👤 Paciente</h3>
            <div style={{ display: "flex", gap: "12px" }}>
              <input
                className="input-field"
                placeholder="Documento"
                value={docBusqueda}
                onChange={(e) => setDocBusqueda(e.target.value)}
              />
              <Button onClick={buscarPaciente} loading={buscandoPaciente}>
                <Search size={16} /> Buscar
              </Button>
              <Button variant="secondary" onClick={limpiarPaciente}>
                <Trash2 size={16} /> Limpiar
              </Button>
            </div>

            {pacienteExistente && (
              <div className="search-found">
                <CheckCircle2 size={18} />
                {pacienteExistente.nombres} {pacienteExistente.apellidos} - {pacienteExistente.documento} - Cel: {pacienteExistente.celular}
              </div>
            )}

            {mostrarFormPaciente && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #ddd" }}>
                <h4>Registrar nuevo paciente</h4>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <input
                    className="input-field"
                    placeholder="Nombres *"
                    value={nuevoPaciente.nombres}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombres: e.target.value })}
                  />
                  <input
                    className="input-field"
                    placeholder="Apellidos *"
                    value={nuevoPaciente.apellidos}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, apellidos: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                  <input
                    className="input-field"
                    placeholder="Celular *"
                    value={nuevoPaciente.celular}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, celular: e.target.value })}
                  />
                  <select
                    className="input-field"
                    value={nuevoPaciente.genero}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, genero: e.target.value as Genero })}
                  >
                    <option>Hombre</option>
                    <option>Mujer</option>
                    <option>Otro</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  onClick={registrarPaciente}
                  loading={registrandoPaciente}
                  style={{ marginTop: "12px" }}
                >
                  <UserPlus size={16} /> Registrar
                </Button>
              </div>
            )}
          </Card>

          <Button
            variant="primary"
            fullWidth
            onClick={agendarCita}
            loading={creando}
            disabled={!fecha || !hora || !medicoId || !pacienteId}
          >
            ✅ Agendar Cita
          </Button>
        </>
      )}

      {/* Modal Código QR */}
      <Modal isOpen={mostrarModalCodigo} onClose={() => setMostrarModalCodigo(false)} title="Código de verificación">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "16px" }}>{codigoVerificacion}</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
            <Button onClick={copiarCodigo}>Copiar código</Button>
            <Button onClick={descargarQR}>Descargar QR</Button>
          </div>
          <QRCodeCanvas id="qr-canvas" value={codigoVerificacion} size={200} />
        </div>
      </Modal>

      {/* Modal Reagendar */}
      <Modal isOpen={mostrarModalReagendar} onClose={() => setMostrarModalReagendar(false)} title="Reagendar Cita">
        <p>Cita actual: {citaSeleccionada?.fecha} {citaSeleccionada?.hora}</p>
        <div style={{ marginTop: "16px" }}>
          <label>Nueva fecha</label>
          <input
            type="date"
            className="input-field"
            value={nuevaFechaReag}
            onChange={(e) => setNuevaFechaReag(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div style={{ marginTop: "16px" }}>
          <label>Nueva hora</label>
          <select
            className="input-field"
            value={nuevaHoraReag}
            onChange={(e) => setNuevaHoraReag(e.target.value)}
            disabled={cargandoHorasReag}
          >
            <option value="">Seleccionar hora</option>
            {horasDisponiblesReag.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        <div className="modal-buttons">
          <Button onClick={reagendarCita} loading={cargandoReagendar}>Guardar</Button>
          <Button variant="secondary" onClick={() => setMostrarModalReagendar(false)}>Cancelar</Button>
        </div>
      </Modal>

      {/* Modal Historial */}
      <Modal isOpen={mostrarModalHistorial} onClose={() => setMostrarModalHistorial(false)} title="Historial" size="lg">
        {cargandoHistorial ? (
          <Spinner />
        ) : historial.length === 0 ? (
          <p>Sin cambios</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Anterior</th>
                  <th>Nuevo</th>
                  <th>Por</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h: any) => (
                  <tr key={h.id}>
                    <td>{h.campo}</td>
                    <td>{h.valorAnterior}</td>
                    <td>{h.valorNuevo}</td>
                    <td>{h.modificadoPor}</td>
                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Button variant="secondary" onClick={() => setMostrarModalHistorial(false)}>Cerrar</Button>
      </Modal>
    </div>
  );
}

export default Citas;