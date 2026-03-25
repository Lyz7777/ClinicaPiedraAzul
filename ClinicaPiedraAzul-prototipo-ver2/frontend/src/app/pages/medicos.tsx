import { useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";
import { 
  getMedicos, 
  crearMedico, 
  actualizarMedico, 
  eliminarMedico,
  getConfiguracionMedico,
  guardarConfiguracionMedico,
  getConfiguracionGlobal,
  guardarConfiguracionGlobal
} from "../services/medicos.service";

// Lista de especialidades predefinidas
const ESPECIALIDADES = [
  "Medicina General",
  "Pediatría",
  "Cardiología",
  "Dermatología",
  "Psicología",
  "Fisioterapia",
  "Ginecología",
  "Oftalmología",
  "Otorrinolaringología",
  "Traumatología",
  "Neurología",
  "Nutrición"
];

interface MedicosProps {
  rol?: "admin" | "agendador" | "paciente";
  modo?: "gestion" | "configuracion";
}

function Medicos({ rol = "agendador", modo = "gestion" }: MedicosProps) {
  const esAdmin = rol === "admin";
  const soloConfiguracion = modo === "configuracion";
  const [medicos, setMedicos] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  
  // Estados para configuración global
  const [ventanaSemanas, setVentanaSemanas] = useState(4);
  const [cargandoGlobal, setCargandoGlobal] = useState(false);
  
  // Estados para configuración por médico
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<any>(null);
  const [diasAtencion, setDiasAtencion] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("17:00");
  const [intervalo, setIntervalo] = useState(30);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [cargandoConfig, setCargandoConfig] = useState(false);

  const diasSemana = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];

  const cargarMedicos = async () => {
    const data = await getMedicos();
    setMedicos(data);
  };

  const cargarConfigGlobal = async () => {
    const config = await getConfiguracionGlobal();
    setVentanaSemanas(config.ventanaSemanas);
  };

  useEffect(() => {
    cargarMedicos();
    cargarConfigGlobal();
  }, []);

  const guardarConfigGlobal = async () => {
    setCargandoGlobal(true);
    try {
      await guardarConfiguracionGlobal(ventanaSemanas);
      alert("Configuración global guardada exitosamente");
    } catch (error) {
      console.error("Error guardando configuración global:", error);
      alert("Error al guardar la configuración global");
    } finally {
      setCargandoGlobal(false);
    }
  };

  const guardarMedico = async () => {
    if (!nombre || !especialidad) {
      alert("Por favor complete todos los campos");
      return;
    }

    if (editandoId) {
      await actualizarMedico(editandoId, { nombre, especialidad });
      setEditandoId(null);
    } else {
      await crearMedico({ nombre, especialidad });
    }

    setNombre("");
    setEspecialidad("");
    cargarMedicos();
  };

  const eliminarMedicoHandler = async (id: number) => {
    if (confirm("¿Eliminar este especialista?")) {
      await eliminarMedico(id);
      cargarMedicos();
    }
  };

  const editarMedico = (m: any) => {
    setNombre(m.nombre);
    setEspecialidad(m.especialidad);
    setEditandoId(m.id);
  };

  const abrirConfiguracion = async (medico: any) => {
    setMedicoSeleccionado(medico);
    setCargandoConfig(true);
    setMostrarConfig(true);
    
    const config = await getConfiguracionMedico(medico.id);
    
    if (config) {
      setDiasAtencion(config.diasAtencion || ["LUNES", "MIÉRCOLES", "VIERNES"]);
      setHoraInicio(config.horaInicio || "08:00");
      setHoraFin(config.horaFin || "17:00");
      setIntervalo(config.intervaloMinutos || 30);
    } else {
      setDiasAtencion(["LUNES", "MIÉRCOLES", "VIERNES"]);
      setHoraInicio("08:00");
      setHoraFin("17:00");
      setIntervalo(30);
    }
    
    setCargandoConfig(false);
  };

  const guardarConfiguracion = async () => {
    if (diasAtencion.length === 0) {
      alert("Debe seleccionar al menos un día de atención");
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
      
      alert(`Configuración guardada para ${medicoSeleccionado.nombre}`);
      setMostrarConfig(false);
      cargarMedicos();
      
    } catch (error) {
      console.error("Error guardando configuración:", error);
      alert("Error al guardar la configuración");
    } finally {
      setCargandoConfig(false);
    }
  };

  const toggleDia = (dia: string) => {
    if (diasAtencion.includes(dia)) {
      setDiasAtencion(diasAtencion.filter(d => d !== dia));
    } else {
      setDiasAtencion([...diasAtencion, dia]);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>{soloConfiguracion ? "Configuración de Horarios" : "Especialistas"}</h2>
        <p>
          {soloConfiguracion
            ? "Ajuste administrativo de disponibilidad médica"
            : "Gestión de médicos y horarios de atención"}
        </p>
      </div>

      {/* Configuración Global */}
      {esAdmin && (
      <div className="card-custom">
        <h4>Configuración Global</h4>
        <div className="form-group">
          <label>Ventana de tiempo para agendar citas (semanas)</label>
          <input
            type="number"
            min="1"
            max="12"
            value={ventanaSemanas}
            onChange={(e) => setVentanaSemanas(parseInt(e.target.value))}
            style={{ width: 120 }}
          />
          <small>Las citas se pueden agendar con {ventanaSemanas} semanas de anticipación</small>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={guardarConfigGlobal}
          disabled={cargandoGlobal}
        >
          {cargandoGlobal ? "Guardando..." : "Guardar Configuración Global"}
        </button>
      </div>
      )}

      {/* Formulario para crear/editar médico */}
      {!soloConfiguracion && (
      <div className="card-custom">
        <h4>{editandoId ? "Editar especialista" : "Nuevo especialista"}</h4>

        <div className="form-group">
          <label>Nombre completo</label>
          <input
            placeholder="Ej: Dra. Ana María García"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Especialidad</label>
          <select
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
          >
            <option value="">Seleccionar especialidad</option>
            {ESPECIALIDADES.map(esp => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
          <small>Seleccione la especialidad del médico</small>
        </div>

        <button className="btn btn-primary" onClick={guardarMedico}>
          {editandoId ? "Actualizar" : "Guardar Especialista"}
        </button>
      </div>
      )}

      {/* Lista de médicos */}
      <h4 style={{ marginBottom: 16, marginTop: 8 }}>
        {soloConfiguracion ? "Médicos para Configurar" : "Lista de Especialistas"}
      </h4>
      
      {medicos.length === 0 ? (
        <div className="empty-state">
          <p>No hay especialistas registrados</p>
          <small>Agregue un nuevo especialista para comenzar</small>
        </div>
      ) : (
        medicos.map((m: any) => (
          <div className="card-custom" key={m.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="logo-icon" style={{ background: "var(--violet-ultralight)", color: "var(--icon-neutral)", fontSize: "1.5rem", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Stethoscope size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "1rem" }}>{m.nombre}</strong>
                  <br />
                  <span className="badge" style={{ background: "var(--violet-ultralight)", color: "var(--violet-primary)", fontSize: "0.7rem", marginTop: 4 }}>
                    {m.especialidad}
                  </span>
                  {m.configuracion && (
                    <>
                      <br />
                      <small style={{ color: "var(--violet-primary)", fontSize: "0.7rem" }}>
                        📅 {m.configuracion.diasAtencion?.join(", ")} | ⏰ {m.configuracion.horaInicio} - {m.configuracion.horaFin}
                      </small>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {!soloConfiguracion && (
                  <button className="btn btn-secondary" onClick={() => editarMedico(m)}>
                    Editar
                  </button>
                )}
                {esAdmin && (
                  <button 
                    className="btn btn-primary"
                    style={{ background: "var(--warning)" }}
                    onClick={() => abrirConfiguracion(m)}
                  >
                    Configurar Horario
                  </button>
                )}
                {!soloConfiguracion && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => eliminarMedicoHandler(m.id)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal de configuración por médico */}
      {mostrarConfig && medicoSeleccionado && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: 32,
            borderRadius: 24,
            width: 550,
            maxWidth: "90%",
            maxHeight: "90%",
            overflowY: "auto"
          }}>
            <h3 style={{ color: "var(--violet-dark)", marginBottom: 8 }}>Configuración de Horarios</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: 20 }}>{medicoSeleccionado.nombre} - {medicoSeleccionado.especialidad}</p>
            
            {cargandoConfig ? (
              <p className="text-center">Cargando configuración...</p>
            ) : (
              <>
                <div className="form-group">
                  <label>Días de atención</label>
                  <div className="dias-grid">
                    {diasSemana.map(dia => (
                      <label key={dia} className="dia-checkbox">
                        <input
                          type="checkbox"
                          checked={diasAtencion.includes(dia)}
                          onChange={() => toggleDia(dia)}
                        />
                        <span>{dia}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Hora de inicio</label>
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hora de fin</label>
                    <input
                      type="time"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Intervalo entre citas</label>
                  <select
                    value={intervalo}
                    onChange={(e) => setIntervalo(parseInt(e.target.value))}
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                  </select>
                  <small>Determina el tiempo entre cada cita</small>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={guardarConfiguracion}
                    disabled={cargandoConfig}
                  >
                    {cargandoConfig ? "Guardando..." : "Guardar Configuración"}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setMostrarConfig(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Medicos;