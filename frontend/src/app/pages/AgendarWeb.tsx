import { useState, useEffect } from "react";
import { getMedicos } from "../services/medicos.service";
import { crearCitaPaciente, getHorasDisponibles } from "../services/citas.service";
import { crearPaciente, buscarPacientePorDocumento, actualizarPaciente } from "../services/pacientes.service";
import { Modal, useToast } from "../../components/UI";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, ChevronRight, ChevronLeft, Stethoscope, CalendarDays, Clock, UserRound, ClipboardCheck } from "lucide-react";
import { useAuth } from "../../auth/useAuth";

const ESPECIALIDADES = [
  { nombre: "Fisioterapia Deportiva", emoji: "⚽", descripcion: "Prevención y rehabilitación de lesiones en atletas" },
  { nombre: "Fisioterapia Neurológica", emoji: "🧠", descripcion: "Afecciones del sistema nervioso (ictus, Parkinson)" },
  { nombre: "Fisioterapia Ortopédica y Traumatológica", emoji: "🦴", descripcion: "Recuperación tras cirugías, fracturas, esguinces" },
  { nombre: "Fisioterapia Pediátrica", emoji: "👶", descripcion: "Desarrollo motor en bebés, niños y adolescentes" },
  { nombre: "Fisioterapia Geriátrica", emoji: "👴", descripcion: "Adultos mayores, prevención de caídas y artrosis" },
  { nombre: "Fisioterapia Respiratoria", emoji: "🫁", descripcion: "Asma, EPOC, secuelas de neumonías" },
  { nombre: "Fisioterapia Cardiovascular", emoji: "❤️", descripcion: "Cardiopatías, readaptación al esfuerzo" },
  { nombre: "Fisioterapia Uroginecológica y Obstétrica", emoji: "🌸", descripcion: "Suelo pélvico, embarazo y postparto" },
  { nombre: "Fisioterapia Oncológica", emoji: "🎗️", descripcion: "Efectos secundarios de tratamientos contra el cáncer" },
];

const PASOS = [
  { num: 1, label: "Especialidad", icon: <Stethoscope size={14} /> },
  { num: 2, label: "Especialista", icon: <UserRound size={14} /> },
  { num: 3, label: "Fecha", icon: <CalendarDays size={14} /> },
  { num: 4, label: "Hora", icon: <Clock size={14} /> },
  { num: 5, label: "Datos", icon: <ClipboardCheck size={14} /> },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const celularRegex = /^[0-9]{7,15}$/;
const docRegex = /^[A-Za-z0-9]{4,20}$/;

function AgendarWeb() {
  const toast = useToast();
  const { getAccessTokenSilently } = useAuth();
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
    nombres: "", apellidos: "", documento: "", celular: "",
    email: "", genero: "Otro" as "Hombre" | "Mujer" | "Otro", fechaNacimiento: ""
  });
  const [erroresPaciente, setErroresPaciente] = useState<Record<string, string>>({});
  const [pacienteExistente, setPacienteExistente] = useState<any>(null);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);

  useEffect(() => {
    const cargarMedicos = async () => {
      try {
        const data = await getMedicos();
        const lista = Array.isArray(data) ? data : data?.data ?? [];
        setMedicos(lista);
      } catch (error) {
        console.error("Error cargando especialistas:", error);
      }
    };
    cargarMedicos();
  }, []);

  useEffect(() => {
    if (!medicoId || !fecha) { setHorasDisponibles([]); return; }
    const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha) && new Date(fecha).getFullYear() >= 2025;
    if (!fechaValida) { setHorasDisponibles([]); return; }
    setCargandoHoras(true);
    getHorasDisponibles(Number(medicoId), fecha)
      .then(h => {
        const lista = Array.isArray(h) ? h : h?.horas ?? h?.data ?? [];
        setHorasDisponibles(lista);
      })
      .catch(() => setHorasDisponibles([]))
      .finally(() => setCargandoHoras(false));
  }, [medicoId, fecha]);

  const medicosFiltrados = especialidad ? medicos.filter(m => m.especialidad === especialidad) : [];

  const buscarPaciente = async (doc: string) => {
    if (!doc || doc.length < 4) return;
    setBuscandoPaciente(true);
    const encontrado = await buscarPacientePorDocumento(doc);
    if (encontrado) {
      setPacienteExistente(encontrado);
      setPaciente({
        nombres: encontrado.nombres || "", apellidos: encontrado.apellidos || "",
        documento: encontrado.documento, celular: encontrado.celular || "",
        email: encontrado.email || "", genero: encontrado.genero || "Otro",
        fechaNacimiento: encontrado.fechaNacimiento || ""
      });
    } else {
      setPacienteExistente(null);
    }
    setBuscandoPaciente(false);
  };

  const validarPaciente = (): boolean => {
    const e: Record<string, string> = {};
    if (!paciente.documento.trim()) e.documento = "El documento es obligatorio";
    else if (!docRegex.test(paciente.documento.trim())) e.documento = "Documento inválido (4-20 caracteres alfanuméricos)";
    if (!paciente.nombres.trim() || paciente.nombres.trim().length < 2) e.nombres = "Nombre obligatorio (mín. 2 caracteres)";
    if (!paciente.apellidos.trim() || paciente.apellidos.trim().length < 2) e.apellidos = "Apellidos obligatorios (mín. 2 caracteres)";
    if (!celularRegex.test(paciente.celular.trim())) e.celular = "Celular inválido (7-15 dígitos)";
    if (paciente.email && !emailRegex.test(paciente.email)) e.email = "Correo electrónico inválido";
    setErroresPaciente(e);
    return Object.keys(e).length === 0;
  };

  const avanzar = () => {
    setErrPaso("");
    if (paso === 1 && !especialidad) { setErrPaso("Selecciona una especialidad para continuar"); return; }
    if (paso === 2 && !medicoId) { setErrPaso("Selecciona un especialista para continuar"); return; }
    if (paso === 3 && !fecha) { setErrPaso("Selecciona una fecha para continuar"); return; }
    if (paso === 4 && !hora) { setErrPaso("Selecciona una hora para continuar"); return; }
    setPaso(p => p + 1);
  };

  const confirmar = async () => {
    if (!validarPaciente()) return;
    setCargando(true);
    try {
      let pacienteId: number;
      const existente = await buscarPacientePorDocumento(paciente.documento.trim());
      if (existente) {
        pacienteId = existente.id;
        if (!existente.auth0Id) {
          const token = await getAccessTokenSilently();
          const payload = JSON.parse(atob(token.split('.')[1]));
          const auth0Id = payload.sub;
          await actualizarPaciente(existente.id, { auth0Id });
        }
      } else {
        const token = await getAccessTokenSilently();
        const payload = JSON.parse(atob(token.split('.')[1]));
        const auth0Id = payload.sub;
        const nuevo = await crearPaciente({ ...paciente, documento: paciente.documento.trim(), auth0Id });
        pacienteId = nuevo.id;
      }
      const citaCreada = await crearCitaPaciente({ fecha, hora, pacienteId, medicoId: Number(medicoId), descripcion: `Cita agendada en línea — ${especialidad}`, estado: "AGENDADA" });
      if (citaCreada?.codigoVerificacion) {
        setCodigoVerificacion(String(citaCreada.codigoVerificacion));
        setMostrarModalCodigo(true);
      }
      setCitaConfirmada(true);
    } catch (err: any) {
      toast.error("Error al agendar la cita", err?.message || "Intente nuevamente");
    } finally {
      setCargando(false);
    }
  };

  const reiniciar = () => {
    setPaso(1); setEspecialidad(""); setMedicoId(""); setMedicoNombre("");
    setFecha(""); setHora(""); setCitaConfirmada(false); setErrPaso("");
    setPaciente({ nombres:"", apellidos:"", documento:"", celular:"", email:"", genero:"Otro", fechaNacimiento:"" });
    setPacienteExistente(null); setErroresPaciente({});
    setCodigoVerificacion(""); setMostrarModalCodigo(false);
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

  const cerrarModalCodigo = () => setMostrarModalCodigo(false);

  if (citaConfirmada) return (
    <>
      <div style={{ display:"flex", justifyContent:"center", padding:"32px 16px" }}>
        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", padding:"40px 32px", maxWidth:460, width:"100%", textAlign:"center", boxShadow:"var(--shadow-lg)" }}>
          <div style={{ width:64, height:64, background:"var(--success-50)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"var(--success-600)" }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize:"1.3rem", fontWeight:700, marginBottom:8 }}>¡Cita confirmada!</h2>
          <p style={{ fontSize:"0.88rem", color:"var(--text-secondary)", marginBottom:20 }}>Tu cita ha sido agendada exitosamente.</p>
          <div style={{ background:"var(--primary-50)", border:"1px solid var(--primary-200)", borderRadius:"var(--radius-lg)", padding:"14px 18px", marginBottom:20, textAlign:"left" }}>
            {[["Especialidad", especialidad], ["Especialista", medicoNombre], ["Fecha", fecha], ["Hora", hora], ["Paciente", `${paciente.nombres} ${paciente.apellidos}`]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid var(--primary-100)", fontSize:"0.82rem" }}>
                <span style={{ color:"var(--text-muted)" }}>{k}</span>
                <strong style={{ color:"var(--primary-700)" }}>{v}</strong>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-md btn-full-width" onClick={reiniciar}>Agendar otra cita</button>
        </div>
      </div>
      <Modal isOpen={mostrarModalCodigo} onClose={cerrarModalCodigo} title="Código de verificación" size="md">
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <p>Copia el código y descarga el QR para presentarlo en tu cita.</p>
          <div style={{ fontSize: "2rem", fontWeight: 700, margin: "16px 0" }}>{codigoVerificacion}</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
            <button className="btn btn-secondary btn-md" onClick={copiarCodigoVerificacion}>Copiar código</button>
            <button className="btn btn-primary btn-md" onClick={descargarCodigoQR}>Descargar QR</button>
          </div>
          <QRCodeCanvas id="codigo-verificacion-qr" value={codigoVerificacion} size={200} />
        </div>
      </Modal>
    </>
  );

  const fechaMax = (() => { const d = new Date(); d.setDate(d.getDate() + 28); return d.toISOString().split("T")[0]; })();

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"0 8px" }}>
      <div className="page-header">
        <h2>Reserva en Línea</h2>
        <p>Agenda tu cita de fisioterapia de forma rápida y sencilla</p>
      </div>
      <div style={{ display:"flex", alignItems:"center", marginBottom:24 }}>
        {PASOS.map((s, i) => (
          <div key={s.num} style={{ display:"flex", alignItems:"center", flex: i < PASOS.length - 1 ? 1 : undefined }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background: paso > s.num ? "var(--success-600)" : paso === s.num ? "var(--primary-600)" : "var(--slate-200)", color: paso >= s.num ? "white" : "var(--slate-400)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.82rem" }}>
                {paso > s.num ? <CheckCircle2 size={16} /> : s.num}
              </div>
              <span style={{ fontSize:"0.62rem", fontWeight: paso === s.num ? 700 : 400 }}>{s.label}</span>
            </div>
            {i < PASOS.length - 1 && <div style={{ flex:1, height:2, margin:"0 6px", marginBottom:18, background: paso > s.num ? "var(--success-600)" : "var(--slate-200)" }} />}
          </div>
        ))}
      </div>
      {errPaso && <div className="inline-warning" style={{ marginBottom:12 }}>⚠️ {errPaso}</div>}
      {paso === 1 && (
        <div className="card card-elevated">
          <div className="card-title">Selecciona una especialidad de fisioterapia</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px,1fr))", gap:10 }}>
            {ESPECIALIDADES.map(esp => (
              <button key={esp.nombre} onClick={() => { setEspecialidad(esp.nombre); setErrPaso(""); }} title={esp.descripcion} style={{ padding:"14px 10px", borderRadius:"var(--radius-md)", border:"2px solid", borderColor: especialidad === esp.nombre ? "var(--primary-500)" : "var(--border)", background: especialidad === esp.nombre ? "var(--primary-50)" : "white", cursor:"pointer", textAlign:"center" }}>
                <div style={{ fontSize:"1.4rem", marginBottom:6 }}>{esp.emoji}</div>
                <div style={{ fontSize:"0.75rem", fontWeight: especialidad === esp.nombre ? 700 : 500 }}>{esp.nombre}</div>
                <div style={{ fontSize:"0.6rem", color:"var(--text-muted)", marginTop:4 }}>{esp.descripcion.substring(0, 40)}...</div>
              </button>
            ))}
          </div>
        </div>
      )}
      {paso === 2 && (
        <div className="card card-elevated">
          <div className="card-title">Especialistas en {especialidad}</div>
          {medicosFiltrados.length === 0 ? <div className="empty-state"><p>No hay especialistas disponibles</p></div> : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {medicosFiltrados.map((m: any) => (
                <button key={m.id} onClick={() => { setMedicoId(m.id); setMedicoNombre(m.nombre); setErrPaso(""); }} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:"var(--radius-md)", border:"2px solid", borderColor: medicoId == m.id ? "var(--primary-500)" : "var(--border)", background: medicoId == m.id ? "var(--primary-50)" : "white", cursor:"pointer", textAlign:"left" }}>
                  <div className="medico-avatar"><Stethoscope size={18} /></div>
                  <div>
                    <strong>{m.nombre}</strong>
                    <span className="badge badge-info" style={{ marginTop:4 }}>{m.especialidad}</span>
                    {m.configuracion && <span style={{ fontSize:"0.72rem", display:"block", marginTop:4 }}>📅 {m.configuracion.horaInicio}–{m.configuracion.horaFin}</span>}
                  </div>
                  {medicoId == m.id && <CheckCircle2 size={18} color="var(--primary-600)" style={{ marginLeft:"auto" }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {paso === 3 && (
        <div className="card card-elevated">
          <div className="card-title">Selecciona la fecha</div>
          <p><strong>{medicoNombre}</strong></p>
          <input type="date" value={fecha} min={new Date().toISOString().split("T")[0]} max={fechaMax} onChange={e => { setFecha(e.target.value); setHora(""); }} className="input-field" style={{ maxWidth:240 }} />
          <small>Las citas se pueden agendar con hasta 4 semanas de anticipación</small>
        </div>
      )}
      {paso === 4 && (
        <div className="card card-elevated">
          <div className="card-title">Selecciona la hora</div>
          <p>{medicoNombre} · {fecha}</p>
          {cargandoHoras ? <div className="spinner-wrap"><div className="spinner-ring spinner-md" /></div> : horasDisponibles.length === 0 ? <div className="empty-state"><p>No hay horarios disponibles</p></div> : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(80px,1fr))", gap:8 }}>
              {horasDisponibles.map(h => (
                <button key={h} onClick={() => { setHora(h); setErrPaso(""); }} style={{ padding:"10px 6px", borderRadius:"var(--radius-md)", border:"2px solid", borderColor: hora === h ? "var(--primary-500)" : "var(--border)", background: hora === h ? "var(--primary-600)" : "white", color: hora === h ? "white" : "var(--text-secondary)", fontWeight: hora === h ? 700 : 500, cursor:"pointer" }}>{h}</button>
              ))}
            </div>
          )}
        </div>
      )}
      {paso === 5 && (
        <div>
          <div className="card card-compact" style={{ background:"var(--primary-50)" }}>
            <p><strong>Resumen de tu cita</strong></p>
            <div>{especialidad} · {medicoNombre} · {fecha} · {hora}</div>
          </div>
          <div className="card card-elevated">
            <div className="card-title">Tus datos personales</div>
            <div className="form-group">
              <input className="input-field" placeholder="Documento de identidad *" value={paciente.documento} onChange={e => { const v = e.target.value; setPaciente(p => ({ ...p, documento: v })); if (v.length >= 4) buscarPaciente(v); }} />
              {pacienteExistente && <div className="search-found">Paciente encontrado</div>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <input className="input-field" placeholder="Nombres *" value={paciente.nombres} disabled={!!pacienteExistente} onChange={e => setPaciente(p => ({ ...p, nombres: e.target.value }))} />
              </div>
              <div className="form-group">
                <input className="input-field" placeholder="Apellidos *" value={paciente.apellidos} disabled={!!pacienteExistente} onChange={e => setPaciente(p => ({ ...p, apellidos: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <input className="input-field" placeholder="Celular *" value={paciente.celular} disabled={!!pacienteExistente} onChange={e => setPaciente(p => ({ ...p, celular: e.target.value.replace(/\D/g,"") }))} />
              </div>
              <div className="form-group">
                <select className="input-field" value={paciente.genero} disabled={!!pacienteExistente} onChange={e => setPaciente(p => ({ ...p, genero: e.target.value as any }))}>
                  <option value="Hombre">Hombre</option><option value="Mujer">Mujer</option><option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <input type="date" className="input-field" value={paciente.fechaNacimiento} disabled={!!pacienteExistente} onChange={e => setPaciente(p => ({ ...p, fechaNacimiento: e.target.value }))} />
              </div>
              <div className="form-group">
                <input type="email" className="input-field" placeholder="Correo electrónico" value={paciente.email} disabled={!!pacienteExistente} onChange={e => setPaciente(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
        {paso > 1 && <button className="btn btn-secondary btn-md" onClick={() => setPaso(p => p - 1)}>Anterior</button>}
        {paso < 5 ? <button className="btn btn-primary btn-md" onClick={avanzar} disabled={(paso===1 && !especialidad)||(paso===2 && !medicoId)||(paso===3 && !fecha)||(paso===4 && !hora)}>Siguiente</button> : <button className="btn btn-success btn-md" onClick={confirmar} disabled={cargando}>{cargando ? "Procesando..." : "Confirmar Cita"}</button>}
      </div>
    </div>
  );
}

export default AgendarWeb;