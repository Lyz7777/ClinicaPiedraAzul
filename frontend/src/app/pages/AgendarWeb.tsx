import { useState, useEffect } from "react";
import { getMedicos } from "../services/medicos.service";
import { crearCitaPaciente, getHorasDisponibles } from "../services/citas.service";
import { crearPaciente, buscarPacientePorDocumento } from "../services/pacientes.service";
import { Modal, useToast, Button, Spinner } from "../../components/UI";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, Stethoscope, CalendarDays, Clock, UserRound, ClipboardCheck, Search } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ESPECIALIDADES = [
  { nombre: "Médico/Terapista", emoji: "🩺", descripcion: "Atención médica general y terapia" },
  { nombre: "Fisioterapeuta", emoji: "💪", descripcion: "Rehabilitación y terapia física" },
  { nombre: "Quiropráctico", emoji: "🦴", descripcion: "Ajuste y cuidado de la columna" },
];

const PASOS = [
  { num: 1, label: "Especialidad", icon: <Stethoscope size={18} /> },
  { num: 2, label: "Especialista", icon: <UserRound size={18} /> },
  { num: 3, label: "Fecha", icon: <CalendarDays size={18} /> },
  { num: 4, label: "Hora", icon: <Clock size={18} /> },
  { num: 5, label: "Datos", icon: <ClipboardCheck size={18} /> },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const celularRegex = /^[0-9]{7,15}$/;
const docRegex = /^[A-Za-z0-9]{4,20}$/;

interface AgendarWebProps {
  esAnonimo?: boolean;
}

function AgendarWeb({ esAnonimo = true }: AgendarWebProps) {
  const toast = useToast();
  const [formKey, setFormKey] = useState(0);
  
  const [paso, setPaso] = useState(1);
  const [especialidad, setEspecialidad] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [medicoNombre, setMedicoNombre] = useState("");
  const [medicos, setMedicos] = useState<any[]>([]);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [citaConfirmada, setCitaConfirmada] = useState(false);
  const [codigoVerificacion, setCodigoVerificacion] = useState("");
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);
  const [errPaso, setErrPaso] = useState("");

  const [paciente, setPaciente] = useState({
    nombres: "", 
    apellidos: "", 
    documento: "", 
    celular: "",
    email: "", 
    genero: "Otro" as "Hombre" | "Mujer" | "Otro", 
    fechaNacimiento: ""
  });
  const [erroresPaciente, setErroresPaciente] = useState<Record<string, string>>({});
  const [pacienteExistente, setPacienteExistente] = useState<any>(null);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [busquedaManual, setBusquedaManual] = useState("");

  useEffect(() => {
    const cargarMedicos = async () => {
      try {
        const data = await getMedicos(esAnonimo);
        const lista = Array.isArray(data) ? data : data?.data ?? [];
        setMedicos(lista);
      } catch (error) {
        console.error("Error cargando especialistas:", error);
        toast.error("Error al cargar especialistas");
      }
    };
    cargarMedicos();
  }, [esAnonimo, toast]);

  useEffect(() => {
    if (!medicoId || !fecha) { setHorasDisponibles([]); return; }
    const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha) && new Date(fecha).getFullYear() >= 2025;
    if (!fechaValida) { setHorasDisponibles([]); return; }
    setCargandoHoras(true);
    getHorasDisponibles(Number(medicoId), fecha, esAnonimo)
      .then(h => {
        const lista = Array.isArray(h) ? h : h?.horas ?? h?.data ?? [];
        setHorasDisponibles(lista);
      })
      .catch(() => setHorasDisponibles([]))
      .finally(() => setCargandoHoras(false));
  }, [medicoId, fecha, esAnonimo]);

  const medicosFiltrados = especialidad ? medicos.filter(m => m.especialidad === especialidad) : [];

  const resetearFormulario = () => {
    setPaso(1);
    setEspecialidad("");
    setMedicoId("");
    setMedicoNombre("");
    setFecha("");
    setHora("");
    setCitaConfirmada(false);
    setErrPaso("");
    setCodigoVerificacion("");
    setMostrarModalCodigo(false);
    setPacienteExistente(null);
    setErroresPaciente({});
    setBusquedaManual("");
    setPaciente({
      nombres: "",
      apellidos: "",
      documento: "",
      celular: "",
      email: "",
      genero: "Otro",
      fechaNacimiento: ""
    });
    setFormKey(prev => prev + 1);
  };

  const buscarPaciente = async () => {
    const doc = busquedaManual.trim();
    if (!doc || doc.length < 4) {
      toast.warning("Ingrese un documento válido (mínimo 4 caracteres)");
      return;
    }
    
    setBuscandoPaciente(true);
    try {
      const response = await fetch(`${API_URL}/citas/public/paciente/${encodeURIComponent(doc)}`);
      const data = await response.json();
      
      if (data.existe && data.paciente) {
        setPacienteExistente(data.paciente);
        setPaciente({
          nombres: data.paciente.nombres || "", 
          apellidos: data.paciente.apellidos || "",
          documento: data.paciente.documento, 
          celular: data.paciente.celular || "",
          email: data.paciente.email || "", 
          genero: data.paciente.genero || "Otro",
          fechaNacimiento: data.paciente.fechaNacimiento || ""
        });
        toast.success(`Paciente encontrado: ${data.paciente.nombres} ${data.paciente.apellidos}`);
      } else {
        setPacienteExistente(null);
        setPaciente(prev => ({ ...prev, documento: doc }));
        toast.info("Paciente no encontrado. Complete los datos para registrarlo.");
      }
    } catch (error) {
      console.error("Error buscando paciente:", error);
      setPacienteExistente(null);
      setPaciente(prev => ({ ...prev, documento: doc }));
      toast.error("Error al buscar paciente");
    } finally {
      setBuscandoPaciente(false);
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaManual("");
    setPacienteExistente(null);
    setPaciente({
      nombres: "",
      apellidos: "",
      documento: "",
      celular: "",
      email: "",
      genero: "Otro",
      fechaNacimiento: ""
    });
  };

  const validarPaciente = (): boolean => {
    const e: Record<string, string> = {};
    if (!paciente.documento.trim()) e.documento = "El documento es obligatorio";
    else if (!docRegex.test(paciente.documento.trim())) e.documento = "Documento inválido (4-20 caracteres)";
    if (!paciente.nombres.trim() || paciente.nombres.trim().length < 2) e.nombres = "Nombre obligatorio (mín. 2 caracteres)";
    if (!paciente.apellidos.trim() || paciente.apellidos.trim().length < 2) e.apellidos = "Apellidos obligatorios (mín. 2 caracteres)";
    if (!celularRegex.test(paciente.celular.trim())) e.celular = "Celular inválido (7-15 dígitos)";
    if (paciente.email && !emailRegex.test(paciente.email)) e.email = "Correo electrónico inválido";
    setErroresPaciente(e);
    return Object.keys(e).length === 0;
  };

  const avanzar = () => {
    setErrPaso("");
    if (paso === 1 && !especialidad) { setErrPaso("Selecciona una especialidad"); return; }
    if (paso === 2 && !medicoId) { setErrPaso("Selecciona un especialista"); return; }
    if (paso === 3 && !fecha) { setErrPaso("Selecciona una fecha"); return; }
    if (paso === 4 && !hora) { setErrPaso("Selecciona una hora"); return; }
    setPaso(p => p + 1);
  };

  const retroceder = () => setPaso(p => p - 1);

  const confirmar = async () => {
    if (!validarPaciente()) return;
    setCargando(true);
    try {
      let pacienteId: number;
      
      // Buscar si el paciente ya existe usando el endpoint público
      const buscarResponse = await fetch(`${API_URL}/citas/public/paciente/${encodeURIComponent(paciente.documento.trim())}`);
      const buscarData = await buscarResponse.json();
      
      if (buscarData.existe && buscarData.paciente) {
        pacienteId = buscarData.paciente.id;
        console.log("Paciente existente ID:", pacienteId);
      } else {
        // Crear nuevo paciente - usando endpoint público
        const crearResponse = await fetch(`${API_URL}/pacientes/public/crear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            nombres: paciente.nombres.trim(),
            apellidos: paciente.apellidos.trim(),
            documento: paciente.documento.trim(),
            celular: paciente.celular.trim(),
            genero: paciente.genero,
            fechaNacimiento: paciente.fechaNacimiento || undefined,
            email: paciente.email || undefined
          })
        });
        
        if (!crearResponse.ok) {
          const errorData = await crearResponse.json();
          throw new Error(errorData.message || "Error al crear paciente");
        }
        
        const nuevoPaciente = await crearResponse.json();
        pacienteId = nuevoPaciente.id;
        console.log("Paciente creado ID:", pacienteId);
      }
      
      // Crear la cita usando el endpoint público
      const citaResponse = await fetch(`${API_URL}/citas/public/agendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fecha, 
          hora, 
          pacienteId, 
          medicoId: Number(medicoId), 
          descripcion: `Cita en línea — ${especialidad}`, 
          estado: "AGENDADA" 
        })
      });
      
      if (!citaResponse.ok) {
        const error = await citaResponse.text();
        throw new Error(error || "Error al agendar");
      }
      
      const citaCreada = await citaResponse.json();
      
      toast.success("¡Cita agendada exitosamente!");
      
      if (citaCreada?.codigoVerificacion) {
        setCodigoVerificacion(String(citaCreada.codigoVerificacion));
        setMostrarModalCodigo(true);
      }
      setCitaConfirmada(true);
    } catch (err: any) {
      console.error("Error al agendar:", err);
      toast.error("Error al agendar", err?.message || "Intente nuevamente");
    } finally {
      setCargando(false);
    }
  };

  const cerrarModal = () => {
    setMostrarModalCodigo(false);
    resetearFormulario();
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

  const irAMisCitas = () => {
    window.location.href = '/mis-citas';
  };

  if (citaConfirmada) {
    return (
      <div style={{ maxWidth: 500, margin: "50px auto", textAlign: "center" }}>
        <div style={{ background: "white", borderRadius: 24, padding: 40 }}>
          <CheckCircle2 size={64} color="#10b981" style={{ margin: "0 auto 20px" }} />
          <h2>¡Cita confirmada!</h2>
          <p>Tu cita ha sido agendada exitosamente.</p>
          <div style={{ background: "#f0f9ff", padding: 16, borderRadius: 12, margin: "20px 0" }}>
            <p><strong>Especialidad:</strong> {especialidad}</p>
            <p><strong>Especialista:</strong> {medicoNombre}</p>
            <p><strong>Fecha:</strong> {fecha}</p>
            <p><strong>Hora:</strong> {hora}</p>
            <p><strong>Paciente:</strong> {paciente.nombres} {paciente.apellidos}</p>
          </div>
          <button className="btn btn-primary" onClick={resetearFormulario} style={{ padding: "12px 24px", fontSize: "1rem" }}>Agendar otra cita</button>
        </div>
        
        {/* Modal QR profesional */}
        <Modal isOpen={mostrarModalCodigo} onClose={cerrarModal} title="🎫 Código de Verificación" size="sm">
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ 
              fontSize: "1.6rem", 
              fontWeight: "bold", 
              letterSpacing: "2px",
              background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: "16px 0",
              padding: "12px",
              backgroundColor: "#F0F9FF",
              borderRadius: "12px",
              fontFamily: "monospace"
            }}>
              {codigoVerificacion}
            </div>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px" }}>
              <button 
                onClick={copiarCodigo}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#0EA5E9",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                📋 Copiar código
              </button>
              <button 
                onClick={descargarQR}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#10B981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                📥 Descargar QR
              </button>
            </div>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              padding: "16px",
              backgroundColor: "white",
              borderRadius: "16px",
              marginTop: "8px"
            }}>
              <QRCodeCanvas 
                id="qr-canvas" 
                value={codigoVerificacion} 
                size={180}
                level="H"
                includeMargin={true}
                style={{ 
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
            </div>
            
            <p style={{ 
              fontSize: "0.7rem", 
              color: "var(--text-muted)", 
              marginTop: "20px",
              marginBottom: "8px"
            }}>
              Presenta este código o QR en recepción
            </p>
          </div>
        </Modal>
      </div>
    );
  }

  const fechaMax = new Date();
  fechaMax.setDate(fechaMax.getDate() + 28);

  return (
    <div key={formKey} style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      <div className="page-header">
        <h2>Reserva en Línea</h2>
        <p>Agenda tu cita de fisioterapia</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button 
          onClick={irAMisCitas}
          style={{ 
            padding: "12px 24px", 
            fontSize: "1rem", 
            fontWeight: "bold",
            backgroundColor: "var(--primary-500)", 
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <Search size={18} /> Consultar mis citas existentes
        </button>
      </div>

      <div style={{ display: "flex", marginBottom: "32px", gap: "8px" }}>
        {PASOS.map((s) => (
          <div key={s.num} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", margin: "0 auto",
              background: paso >= s.num ? "var(--primary-600)" : "var(--slate-200)",
              color: paso >= s.num ? "white" : "var(--slate-400)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem", fontWeight: "bold"
            }}>
              {paso > s.num ? <CheckCircle2 size={20} /> : s.num}
            </div>
            <span style={{ fontSize: "0.75rem", marginTop: "8px", display: "block" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {paso === 1 && (
        <div className="card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Selecciona una especialidad</h3>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))" }}>
            {ESPECIALIDADES.map(esp => (
              <button key={esp.nombre} onClick={() => setEspecialidad(esp.nombre)} style={{
                padding: "16px", borderRadius: "12px", border: `2px solid ${especialidad === esp.nombre ? "#0EA5E9" : "#E2E8F0"}`,
                background: especialidad === esp.nombre ? "#F0F9FF" : "white", cursor: "pointer", fontSize: "0.9rem"
              }}>
                <div style={{ fontSize: "1.8rem" }}>{esp.emoji}</div>
                <div style={{ fontWeight: "bold" }}>{esp.nombre}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{esp.descripcion}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Especialistas en {especialidad}</h3>
          {medicosFiltrados.map(m => (
            <button key={m.id} onClick={() => { setMedicoId(m.id); setMedicoNombre(m.nombre); }} style={{
              display: "flex", gap: "16px", padding: "16px", borderRadius: "12px", width: "100%",
              border: `2px solid ${medicoId == m.id ? "#0EA5E9" : "#E2E8F0"}`,
              background: medicoId == m.id ? "#F0F9FF" : "white", cursor: "pointer", marginBottom: "12px",
              fontSize: "0.9rem"
            }}>
              <div className="medico-avatar" style={{ width: "48px", height: "48px" }}><Stethoscope size={24} /></div>
              <div style={{ textAlign: "left" }}>
                <strong style={{ fontSize: "1rem" }}>{m.nombre}</strong>
                <br />
                <span className="badge badge-info" style={{ marginTop: "4px", display: "inline-block" }}>{m.especialidad}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {paso === 3 && (
        <div className="card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Selecciona la fecha</h3>
          <p style={{ marginBottom: "12px" }}><strong>{medicoNombre}</strong></p>
          <input type="date" className="input-field" value={fecha}
            min={new Date().toISOString().split("T")[0]} max={fechaMax.toISOString().split("T")[0]}
            onChange={e => setFecha(e.target.value)}
            style={{ padding: "12px", fontSize: "1rem" }} />
        </div>
      )}

      {paso === 4 && (
        <div className="card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Selecciona la hora</h3>
          <p style={{ marginBottom: "12px" }}>{medicoNombre} - {fecha}</p>
          {cargandoHoras ? <Spinner /> : (
            <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fill, minmax(90px,1fr))" }}>
              {horasDisponibles.map(h => (
                <button key={h} onClick={() => setHora(h)} style={{
                  padding: "12px", borderRadius: "8px", border: `2px solid ${hora === h ? "#0EA5E9" : "#E2E8F0"}`,
                  background: hora === h ? "#0EA5E9" : "white", color: hora === h ? "white" : "inherit", 
                  cursor: "pointer", fontSize: "0.9rem"
                }}>{h}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {paso === 5 && (
        <div>
          <div className="card" style={{ background: "#F0F9FF" }}>
            <p><strong>Resumen</strong></p>
            <p>{especialidad} - {medicoNombre} - {fecha} - {hora}</p>
          </div>
          <div className="card">
            <h3>Tus datos</h3>
            
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                className="input-field"
                placeholder="Buscar por documento (ej: 1002964972)"
                value={busquedaManual}
                onChange={e => setBusquedaManual(e.target.value)}
                style={{ padding: "12px" }}
              />
              <Button onClick={buscarPaciente} loading={buscandoPaciente} variant="secondary">
                <Search size={16} /> Buscar
              </Button>
              <Button onClick={limpiarBusqueda} variant="outline">
                Limpiar
              </Button>
            </div>
            
            {pacienteExistente && (
              <div className="search-found" style={{ marginBottom: 16, padding: "12px", borderRadius: "8px", background: "#E8F5E9", color: "#2E7D32" }}>
                <CheckCircle2 size={18} />
                <strong>Paciente encontrado:</strong> {pacienteExistente.nombres} {pacienteExistente.apellidos} - {pacienteExistente.documento}
              </div>
            )}
            
            <input className="input-field" placeholder="Documento *" value={paciente.documento}
              onChange={e => setPaciente(p => ({ ...p, documento: e.target.value }))}
              style={{ padding: "12px", marginBottom: "12px" }} />
            
            <div style={{ display: "flex", gap: "12px" }}>
              <input className="input-field" placeholder="Nombres *" value={paciente.nombres} disabled={!!pacienteExistente}
                onChange={e => setPaciente(p => ({ ...p, nombres: e.target.value }))}
                style={{ padding: "12px" }} />
              <input className="input-field" placeholder="Apellidos *" value={paciente.apellidos} disabled={!!pacienteExistente}
                onChange={e => setPaciente(p => ({ ...p, apellidos: e.target.value }))}
                style={{ padding: "12px" }} />
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <input className="input-field" placeholder="Celular *" value={paciente.celular} disabled={!!pacienteExistente}
                onChange={e => setPaciente(p => ({ ...p, celular: e.target.value.replace(/\D/g, "") }))}
                style={{ padding: "12px" }} />
              <select className="input-field" value={paciente.genero} disabled={!!pacienteExistente}
                onChange={e => setPaciente(p => ({ ...p, genero: e.target.value as any }))}
                style={{ padding: "12px" }}>
                <option>Hombre</option><option>Mujer</option><option>Otro</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <input type="date" className="input-field" value={paciente.fechaNacimiento} disabled={!!pacienteExistente}
                onChange={e => setPaciente(p => ({ ...p, fechaNacimiento: e.target.value }))}
                style={{ padding: "12px" }} />
              <input type="email" className="input-field" placeholder="Email" value={paciente.email} disabled={!!pacienteExistente}
                onChange={e => setPaciente(p => ({ ...p, email: e.target.value }))}
                style={{ padding: "12px" }} />
            </div>
            {erroresPaciente.documento && <span className="input-error-message">{erroresPaciente.documento}</span>}
            {erroresPaciente.nombres && <span className="input-error-message">{erroresPaciente.nombres}</span>}
            {erroresPaciente.apellidos && <span className="input-error-message">{erroresPaciente.apellidos}</span>}
            {erroresPaciente.celular && <span className="input-error-message">{erroresPaciente.celular}</span>}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", gap: "16px" }}>
        {paso > 1 && (
          <button className="btn btn-secondary" onClick={retroceder} style={{ padding: "12px 24px", fontSize: "1rem", cursor: "pointer" }}>
            ◀ Anterior
          </button>
        )}
        {paso < 5 ? (
          <button className="btn btn-primary" onClick={avanzar} disabled={
            (paso === 1 && !especialidad) || (paso === 2 && !medicoId) ||
            (paso === 3 && !fecha) || (paso === 4 && !hora)
          } style={{ padding: "12px 24px", fontSize: "1rem", cursor: "pointer", marginLeft: "auto" }}>
            Siguiente ▶
          </button>
        ) : (
          <button className="btn btn-success" onClick={confirmar} disabled={cargando} style={{ padding: "12px 24px", fontSize: "1rem", cursor: "pointer", marginLeft: "auto" }}>
            {cargando ? "Procesando..." : "Confirmar Cita ✅"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AgendarWeb;