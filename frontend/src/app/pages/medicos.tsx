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
  "Medicina General", "Pediatría", "Cardiología", "Dermatología",
  "Psicología", "Fisioterapia", "Ginecología", "Oftalmología",
  "Otorrinolaringología", "Traumatología", "Neurología", "Nutrición",
];

const DIAS_SEMANA = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];

const DIAS_ABREVIADOS: Record<string, string> = {
  "LUNES": "Lun", "MARTES": "Mar", "MIÉRCOLES": "Mié", "JUEVES": "Jue",
  "VIERNES": "Vie", "SÁBADO": "Sáb", "DOMINGO": "Dom",
};

interface MedicosProps {
  rol?: "admin" | "agendador" | "paciente" | "medico";
  modo?: "gestion" | "configuracion";
}

function Medicos({ rol = "agendador", modo = "gestion" }: MedicosProps) {
  const toast = useToast();
  const esAdmin = rol === "admin";
  const soloLectura = rol === "agendador" && modo === "gestion";

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

  // Función para normalizar los días a array
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
      // Normalizar la configuración de cada médico
      const listaNormalizada = lista.map((medico: any) => ({
        ...medico,
        configuracion: medico.configuracion ? {
          ...medico.configuracion,
          diasAtencion: normalizarDias(medico.configuracion.diasAtencion)
        } : null
      }));
      setMedicos(listaNormalizada);
    } catch (err: any) {
      toast.error("Error al cargar especialistas", err.message);
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => {
    cargarMedicos();
    if (esAdmin) {
      getConfiguracionGlobal()
        .then((c) => setVentanaSemanas(c?.ventanaSemanas || 4))
        .catch(() => setVentanaSemanas(4));
    }
  }, [cargarMedicos, esAdmin]);

  const validarMedico = (): boolean => {
    const e: { nombre?: string; especialidad?: string } = {};
    if (!nombre.trim()) e.nombre = "El nombre es obligatorio";
    else if (nombre.trim().length < 3) e.nombre = "Mínimo 3 caracteres";
    if (!especialidad) e.especialidad = "Seleccione una especialidad";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const guardarMedico = async () => {
    if (!validarMedico()) return;
    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarMedico(editandoId, { nombre: nombre.trim(), especialidad });
        toast.success("Especialista actualizado");
        setEditandoId(null);
      } else {
        await crearMedico({ nombre: nombre.trim(), especialidad });
        toast.success("Especialista registrado correctamente");
      }
      setNombre("");
      setEspecialidad("");
      setErrors({});
      await cargarMedicos();
    } catch (err: any) {
      toast.error("Error al guardar", err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarMedicoHandler = async (id: number) => {
    if (!confirm("¿Eliminar este especialista? Se eliminarán todas sus citas.")) return;
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
      toast.error("Error al guardar configuración global");
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
      setDiasAtencion(["LUNES", "MIÉRCOLES", "VIERNES"]);
    } finally {
      setCargandoConfig(false);
    }
  };

  const guardarConfiguracion = async () => {
    if (diasAtencion.length === 0) {
      toast.warning("Seleccione al menos un día de atención");
      return;
    }
    if (horaInicio >= horaFin) {
      toast.warning("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }
    setCargandoConfig(true);
    try {
      await guardarConfiguracionMedico(medicoSeleccionado.id, {
        diasAtencion,
        horaInicio,
        horaFin,
        intervaloMinutos: intervalo,
      });
      toast.success(`Horario guardado para ${medicoSeleccionado.nombre}`);
      setMostrarConfig(false);
      
      // Recargar médicos y esperar a que termine
      await cargarMedicos();
      
    } catch (error) {
      toast.error("Error al guardar la configuración");
    } finally {
      setCargandoConfig(false);
    }
  };

  const toggleDia = (dia: string) => {
    setDiasAtencion((prev) => {
      if (prev.includes(dia)) {
        return prev.filter((d) => d !== dia);
      }
      return [...prev, dia];
    });
  };

  // Función para verificar si un día está en la configuración
  const diaAtiende = (configuracion: any, dia: string): boolean => {
    if (!configuracion) return false;
    const dias = normalizarDias(configuracion.diasAtencion);
    return dias.includes(dia);
  };

  return (
    <div>
      <div className="page-header">
        <h2>🏥 Especialistas</h2>
        <p>
          {soloLectura
            ? "Consulta de médicos (solo lectura)"
            : modo === "configuracion"
            ? "Ajuste administrativo de disponibilidad"
            : "Gestión de médicos, terapeutas y sus horarios de atención"}
        </p>
      </div>

      {esAdmin && (
        <Card title="⚙️ Configuración Global del Sistema" variant="elevated">
          <div className="form-row" style={{ alignItems: "flex-end" }}>
            <div style={{ flex: 2 }}>
              <label className="input-label">📅 Ventana para agendar citas</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input type="range" min="1" max="12" value={ventanaSemanas}
                  onChange={(e) => setVentanaSemanas(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ minWidth: "60px", fontWeight: 600 }}>
                  {ventanaSemanas} semana{ventanaSemanas !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <Button variant="primary" onClick={guardarConfigGlobal} loading={cargandoGlobal}>
              <Save size={16} /> Guardar configuración
            </Button>
          </div>
        </Card>
      )}

      {!soloLectura && modo !== "configuracion" && (
        <Card title={editandoId ? "✏️ Editar especialista" : "➕ Nuevo especialista"} variant="elevated">
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="input-label">Nombre completo <span className="input-required">*</span></label>
              <input type="text" className="input-field" value={nombre}
                onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Dra. Ana María García" />
              {errors.nombre && <span className="input-error-message">{errors.nombre}</span>}
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="input-label">Especialidad <span className="input-required">*</span></label>
              <select className="input-field" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}>
                <option value="">Seleccionar especialidad</option>
                {ESPECIALIDADES.map((esp) => <option key={esp} value={esp}>{esp}</option>)}
              </select>
              {errors.especialidad && <span className="input-error-message">{errors.especialidad}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="primary" onClick={guardarMedico} loading={guardando}>
              {editandoId ? "Actualizar especialista" : "Guardar especialista"}
            </Button>
            {editandoId && <Button variant="secondary" onClick={cancelarEdicion}>Cancelar</Button>}
          </div>
        </Card>
      )}

      {cargando ? <Spinner text="Cargando especialistas..." /> : medicos.length === 0 ? (
        <Card><div className="empty-state">
          <Stethoscope size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <p>No hay especialistas registrados</p>
        </div></Card>
      ) : (
        medicos.map((m: any) => (
          <Card key={m.id} variant="compact">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 250 }}>
                <div className="medico-avatar"><Stethoscope size={20} /></div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "1rem", display: "block", marginBottom: 6 }}>{m.nombre}</strong>
                  <span className="badge badge-info" style={{ marginBottom: 8 }}>{m.especialidad}</span>

                  {m.configuracion ? (
                    <div style={{ background: "var(--primary-50)", borderRadius: 12, padding: "12px 14px", marginTop: 8, border: "1px solid var(--primary-100)" }}>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                          📅 Días de atención:
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {DIAS_SEMANA.map((dia) => {
                            const atiende = diaAtiende(m.configuracion, dia);
                            return (
                              <span key={dia} style={{
                                padding: "3px 8px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600,
                                background: atiende ? "var(--primary-500)" : "var(--slate-100)",
                                color: atiende ? "white" : "var(--slate-400)",
                              }}>
                                {DIAS_ABREVIADOS[dia] || dia.slice(0, 3)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={12} /> {m.configuracion.horaInicio} – {m.configuracion.horaFin}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                          ⏱️ cada {m.configuracion.intervaloMinutos} min
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: "var(--warning-50)", borderRadius: 8, padding: "8px 12px", marginTop: 8, display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: "var(--warning-600)" }}>
                      <AlertCircle size={14} /> Sin horario configurado
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                {!soloLectura ? (
                  <>
                    {modo !== "configuracion" && (
                      <Button variant="secondary" size="sm" onClick={() => editarMedico(m)}>✏️ Editar</Button>
                    )}
                    {esAdmin && (
                      <Button variant="primary" size="sm" onClick={() => abrirConfiguracion(m)}>
                        <Settings size={14} /> Horario
                      </Button>
                    )}
                    {modo !== "configuracion" && esAdmin && (
                      <Button variant="danger" size="sm" onClick={() => eliminarMedicoHandler(m.id)}>🗑️</Button>
                    )}
                  </>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <Eye size={14} /> Solo consulta
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))
      )}

      <Modal isOpen={mostrarConfig && esAdmin} onClose={() => setMostrarConfig(false)}
        title={`🕐 Configurar horario - ${medicoSeleccionado?.nombre}`} size="md">
        {cargandoConfig ? <Spinner text="Cargando configuración..." /> : (
          <>
            <div className="form-group">
              <label className="input-label">📅 Días de atención <span className="input-required">*</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {DIAS_SEMANA.map((dia) => (
                  <button key={dia} type="button" onClick={() => toggleDia(dia)}
                    style={{
                      padding: "10px 16px", borderRadius: "30px",
                      border: diasAtencion.includes(dia) ? "2px solid var(--primary-500)" : "1px solid var(--border)",
                      background: diasAtencion.includes(dia) ? "var(--primary-500)" : "white",
                      color: diasAtencion.includes(dia) ? "white" : "var(--text-secondary)",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s",
                    }}>
                    {dia.slice(0, 3)}
                  </button>
                ))}
              </div>
              {diasAtencion.length === 0 && (
                <span className="input-error-message">Seleccione al menos un día de atención</span>
              )}
            </div>
            <div className="form-row" style={{ display: "flex", gap: 16, marginTop: 16 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="input-label">⏰ Hora de inicio <span className="input-required">*</span></label>
                <input type="time" className="input-field" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="input-label">⏰ Hora de fin <span className="input-required">*</span></label>
                <input type="time" className="input-field" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
              </div>
            </div>
            {horaInicio >= horaFin && horaFin !== "" && (
              <div style={{ background: "var(--warning-50)", padding: 10, borderRadius: 8, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "var(--warning-600)", fontSize: "0.85rem" }}>
                <AlertCircle size={16} /> La hora de inicio debe ser anterior a la hora de fin
              </div>
            )}
            <div className="form-group">
              <label className="input-label">⏱️ Intervalo entre citas (minutos)</label>
              <select value={intervalo} onChange={(e) => setIntervalo(parseInt(e.target.value))} className="input-field">
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>
            <div className="modal-buttons" style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
              <Button variant="primary" onClick={guardarConfiguracion} loading={cargandoConfig}>
                <Save size={16} /> Guardar configuración
              </Button>
              <Button variant="secondary" onClick={() => setMostrarConfig(false)}>Cancelar</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Medicos;