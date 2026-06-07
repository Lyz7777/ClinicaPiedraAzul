import { useEffect, useState, useCallback } from "react";
import { Stethoscope, Eye, Clock, CalendarDays, Settings, Save, AlertCircle } from "lucide-react";
import {
  getMedicos,
  crearMedico,
  actualizarMedico,
  eliminarMedico,
  getConfiguracionMedico,
  guardarConfiguracionMedico,
  getConfiguracionGlobal,
  guardarConfiguracionGlobal,
} from "../services/medicos.service";
import { Button, Input, Card, Modal, Spinner, useToast } from "../../components/UI";

const ESPECIALIDADES = [
  "Médico/Terapista",
  "Fisioterapeuta",
  "Quiropráctico",
];

const DIAS_SEMANA = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];
const DIAS_ABREVIADOS: Record<string, string> = { 
  "LUNES": "Lun", "MARTES": "Mar", "MIÉRCOLES": "Mié", 
  "JUEVES": "Jue", "VIERNES": "Vie", "SÁBADO": "Sáb", "DOMINGO": "Dom" 
};

interface MedicosProps { 
  rol?: "admin" | "agendador" | "paciente" | "medico"; 
  modo?: "gestion" | "configuracion"; 
}

function Medicos({ rol = "agendador", modo = "gestion" }: MedicosProps) {
  const toast = useToast();
  const esAdmin = rol === "admin";
  // Médico puede ver la lista (solo lectura), agendador también solo lectura
  const soloLectura = rol === "agendador" || rol === "medico";
  const puedeEditar = esAdmin; // Solo admin puede crear/editar/eliminar

  const [medicos, setMedicos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ nombre?: string; especialidad?: string }>({});
  const [guardando, setGuardando] = useState(false);
  const [ventanaSemanas, setVentanaSemanas] = useState(4);
  const [cargandoGlobal, setCargandoGlobal] = useState(false);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<any>(null);
  const [diasAtencion, setDiasAtencion] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("17:00");
  const [intervalo, setIntervalo] = useState(30);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [cargandoConfig, setCargandoConfig] = useState(false);

  const normalizarDias = (dias: any): string[] => {
    if (!dias) return [];
    if (Array.isArray(dias)) return dias;
    if (typeof dias === 'string') return dias.split(',');
    return [];
  };

  const cargarMedicos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getMedicos();
      const lista = Array.isArray(data) ? data : data?.data ?? [];
      setMedicos(lista);
    } catch (err: any) {
      toast.error("Error al cargar especialistas", err.message);
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => { 
    cargarMedicos(); 
    if (esAdmin) {
      getConfiguracionGlobal().then(c => setVentanaSemanas(c?.ventanaSemanas || 4)).catch(() => setVentanaSemanas(4)); 
    }
  }, [cargarMedicos, esAdmin]);

  const guardarMedico = async () => {
    if (!nombre.trim() || nombre.trim().length < 3) { 
      setErrors({ nombre: "Nombre obligatorio (mín. 3 caracteres)" }); 
      return; 
    }
    if (!especialidad) { 
      setErrors({ especialidad: "Seleccione una especialidad" }); 
      return; 
    }
    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarMedico(editandoId, { nombre: nombre.trim(), especialidad });
        toast.success("Especialista actualizado");
      } else {
        await crearMedico({ nombre: nombre.trim(), especialidad });
        toast.success("Especialista registrado");
      }
      setNombre(""); 
      setEspecialidad(""); 
      setEditandoId(null); 
      setErrors({});
      await cargarMedicos();
    } catch (err: any) { 
      toast.error("Error al guardar", err.message); 
    } finally { 
      setGuardando(false); 
    }
  };

  const eliminarMedicoHandler = async (id: number) => {
    if (!confirm("¿Eliminar este especialista?")) return;
    try { 
      await eliminarMedico(id); 
      toast.success("Especialista eliminado"); 
      await cargarMedicos(); 
    } catch (err: any) { 
      toast.error("Error al eliminar", err.message); 
    }
  };

  const editarMedico = (m: any) => { 
    setNombre(m.nombre); 
    setEspecialidad(m.especialidad); 
    setEditandoId(m.id); 
    setErrors({}); 
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };
  
  const cancelarEdicion = () => { 
    setEditandoId(null); 
    setNombre(""); 
    setEspecialidad(""); 
    setErrors({}); 
  };

  const guardarConfigGlobal = async () => {
    if (ventanaSemanas < 1 || ventanaSemanas > 12) { 
      toast.warning("La ventana debe estar entre 1 y 12 semanas"); 
      return; 
    }
    setCargandoGlobal(true);
    try { 
      await guardarConfiguracionGlobal(ventanaSemanas); 
      toast.success("Configuración global guardada"); 
    } catch { 
      toast.error("Error al guardar"); 
    } finally { 
      setCargandoGlobal(false); 
    }
  };

  const abrirConfiguracion = async (medico: any) => {
    setMedicoSeleccionado(medico); 
    setCargandoConfig(true); 
    setMostrarConfig(true);
    try {
      const config = await getConfiguracionMedico(medico.id);
      if (config) { 
        setDiasAtencion(normalizarDias(config.diasAtencion)); 
        setHoraInicio(config.horaInicio || "08:00"); 
        setHoraFin(config.horaFin || "17:00"); 
        setIntervalo(config.intervaloMinutos || 30); 
      } else { 
        setDiasAtencion(["LUNES", "MIÉRCOLES", "VIERNES"]); 
        setHoraInicio("08:00"); 
        setHoraFin("17:00"); 
        setIntervalo(30); 
      }
    } catch { 
      toast.error("Error al cargar configuración"); 
    } finally { 
      setCargandoConfig(false); 
    }
  };

  const guardarConfiguracion = async () => {
    if (diasAtencion.length === 0) { 
      toast.warning("Seleccione al menos un día"); 
      return; 
    }
    if (horaInicio >= horaFin) { 
      toast.warning("Hora de inicio debe ser anterior a la de fin"); 
      return; 
    }
    setCargandoConfig(true);
    try {
      await guardarConfiguracionMedico(medicoSeleccionado.id, { 
        diasAtencion, 
        horaInicio, 
        horaFin, 
        intervaloMinutos: intervalo 
      });
      toast.success(`Horario guardado para ${medicoSeleccionado.nombre}`);
      setMostrarConfig(false);
      await cargarMedicos();
    } catch { 
      toast.error("Error al guardar"); 
    } finally { 
      setCargandoConfig(false); 
    }
  };

  const toggleDia = (dia: string) => 
    setDiasAtencion(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
  
  const diaAtiende = (configuracion: any, dia: string) => 
    normalizarDias(configuracion?.diasAtencion).includes(dia);

  return (
    <div>
      <div className="page-header">
        <h2>🏥 Especialistas</h2>
        <p>{rol === "medico" ? "Consulta de especialistas de la clínica" : "Gestión de fisioterapeutas y sus horarios de atención"}</p>
      </div>
      
      {/* Configuración Global - Solo Admin */}
      {esAdmin && (
        <Card title="⚙️ Configuración Global">
          <div className="form-row" style={{ alignItems: "flex-end" }}>
            <div style={{ flex: 2 }}>
              <label>📅 Ventana para agendar citas ({ventanaSemanas} semanas)</label>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={ventanaSemanas} 
                onChange={(e) => setVentanaSemanas(parseInt(e.target.value))} 
                style={{ width: "100%" }} 
              />
            </div>
            <Button variant="primary" onClick={guardarConfigGlobal} loading={cargandoGlobal}>
              Guardar
            </Button>
          </div>
        </Card>
      )}
      
      {/* Formulario para crear/editar - Solo Admin */}
      {puedeEditar && modo !== "configuracion" && (
        <Card title={editandoId ? "✏️ Editar especialista" : "➕ Nuevo especialista"}>
          <div className="form-row">
            <input 
              className="input-field" 
              placeholder="Nombre completo *" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
            />
            <select 
              className="input-field" 
              value={especialidad} 
              onChange={e => setEspecialidad(e.target.value)}
            >
              <option value="">Seleccionar especialidad</option>
              {ESPECIALIDADES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
            </select>
          </div>
          {errors.nombre && <span className="input-error-message">{errors.nombre}</span>}
          {errors.especialidad && <span className="input-error-message">{errors.especialidad}</span>}
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <Button variant="primary" onClick={guardarMedico} loading={guardando}>
              {editandoId ? "Actualizar" : "Guardar"}
            </Button>
            {editandoId && <Button variant="secondary" onClick={cancelarEdicion}>Cancelar</Button>}
          </div>
        </Card>
      )}
      
      {/* Lista de especialistas */}
      {cargando ? <Spinner /> : medicos.length === 0 ? (
        <Card><div className="empty-state">No hay especialistas registrados</div></Card>
      ) : (
        medicos.map((m: any) => (
          <Card key={m.id} variant="compact">
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", gap: 14, flex: 1 }}>
                <div className="medico-avatar"><Stethoscope size={20} /></div>
                <div>
                  <strong>{m.nombre}</strong>
                  <span className="badge badge-info" style={{ marginLeft: 8 }}>{m.especialidad}</span>
                  {m.configuracion && (
                    <div style={{ marginTop: 8, background: "var(--primary-50)", padding: 10, borderRadius: 12 }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                        {DIAS_SEMANA.map(dia => (
                          <span key={dia} style={{ 
                            padding: "2px 8px", 
                            borderRadius: 20, 
                            fontSize: "0.7rem", 
                            background: diaAtiende(m.configuracion, dia) ? "var(--primary-500)" : "var(--slate-100)", 
                            color: diaAtiende(m.configuracion, dia) ? "white" : "var(--slate-400)" 
                          }}>
                            {DIAS_ABREVIADOS[dia]}
                          </span>
                        ))}
                      </div>
                      <div>{m.configuracion.horaInicio} – {m.configuracion.horaFin} · cada {m.configuracion.intervaloMinutos} min</div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {/* Ver horario - todos pueden ver */}
                <Button variant="outline" size="sm" onClick={() => abrirConfiguracion(m)}>
                  <Clock size={14} /> Horario
                </Button>
                {/* Editar - solo admin */}
                {puedeEditar && modo !== "configuracion" && (
                  <Button variant="secondary" size="sm" onClick={() => editarMedico(m)}>Editar</Button>
                )}
                {/* Eliminar - solo admin */}
                {puedeEditar && modo !== "configuracion" && esAdmin && (
                  <Button variant="danger" size="sm" onClick={() => eliminarMedicoHandler(m.id)}>🗑️</Button>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
      
      {/* Modal de configuración de horario */}
      <Modal isOpen={mostrarConfig} onClose={() => setMostrarConfig(false)} title={`Configurar horario - ${medicoSeleccionado?.nombre}`} size="md">
        <div className="form-group">
          <label>Días de atención</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DIAS_SEMANA.map(dia => (
              <button 
                key={dia} 
                onClick={() => esAdmin && toggleDia(dia)} 
                disabled={!esAdmin}
                style={{ 
                  padding: "8px 16px", 
                  borderRadius: 30, 
                  border: diasAtencion.includes(dia) ? "2px solid var(--primary-500)" : "1px solid var(--border)", 
                  background: diasAtencion.includes(dia) ? "var(--primary-500)" : "white", 
                  color: diasAtencion.includes(dia) ? "white" : "var(--text-secondary)", 
                  cursor: esAdmin ? "pointer" : "not-allowed",
                  opacity: esAdmin ? 1 : 0.6
                }}
              >
                {dia.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
        <div className="form-row" style={{ marginTop: 16 }}>
          <input 
            type="time" 
            className="input-field" 
            value={horaInicio} 
            onChange={e => esAdmin && setHoraInicio(e.target.value)} 
            disabled={!esAdmin}
          />
          <input 
            type="time" 
            className="input-field" 
            value={horaFin} 
            onChange={e => esAdmin && setHoraFin(e.target.value)} 
            disabled={!esAdmin}
          />
        </div>
        <select 
          className="input-field" 
          value={intervalo} 
          onChange={e => esAdmin && setIntervalo(parseInt(e.target.value))}
          disabled={!esAdmin}
        >
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
          <option value={45}>45 min</option>
          <option value={60}>60 min</option>
        </select>
        {esAdmin && (
          <div className="modal-buttons" style={{ marginTop: 16 }}>
            <Button variant="primary" onClick={guardarConfiguracion} loading={cargandoConfig}>Guardar</Button>
            <Button variant="secondary" onClick={() => setMostrarConfig(false)}>Cancelar</Button>
          </div>
        )}
        {!esAdmin && (
          <div style={{ marginTop: 16, textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Solo el administrador puede modificar los horarios
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Medicos;