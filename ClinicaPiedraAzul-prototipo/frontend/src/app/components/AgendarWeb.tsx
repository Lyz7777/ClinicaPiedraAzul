import { useState, useEffect } from "react";
import { getMedicos } from "../services/medicos.service";
import { crearCita, getHorasDisponibles } from "../services/citas.service";
import { crearPaciente, buscarPacientePorDocumento } from "../services/pacientes.service";

// Lista de especialidades (debe coincidir con la de médicos)
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

function AgendarWeb() {
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
  const [paciente, setPaciente] = useState({
    nombres: "",
    apellidos: "",
    documento: "",
    celular: "",
    email: "",
    genero: "Otro" as "Hombre" | "Mujer" | "Otro",
    fechaNacimiento: ""
  });
  const [pacienteExistente, setPacienteExistente] = useState<any>(null);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Cargar médicos desde el backend
  useEffect(() => {
    const cargarMedicos = async () => {
      const data = await getMedicos();
      setMedicos(data);
    };
    cargarMedicos();
  }, []);

  // Filtrar médicos por especialidad seleccionada
  const medicosFiltrados = especialidad 
    ? medicos.filter(m => m.especialidad === especialidad)
    : [];

  const limpiarError = (campo: string) => {
    setErrores((actuales) => {
      if (!actuales[campo]) {
        return actuales;
      }

      const siguientes = { ...actuales };
      delete siguientes[campo];
      return siguientes;
    });
  };

  const validarPaso = (pasoActual: number) => {
    const siguientesErrores: Record<string, string> = {};

    if (pasoActual === 1 && !especialidad) {
      siguientesErrores.especialidad = "Seleccione una especialidad.";
    }

    if (pasoActual === 2 && !medicoId) {
      siguientesErrores.medicoId = "Seleccione un especialista.";
    }

    if (pasoActual === 3 && !fecha) {
      siguientesErrores.fecha = "Seleccione una fecha.";
    }

    if (pasoActual === 4 && !hora) {
      siguientesErrores.hora = "Seleccione una hora.";
    }

    setErrores((actuales) => ({ ...actuales, ...siguientesErrores }));
    return Object.keys(siguientesErrores).length === 0;
  };

  const validarPaciente = () => {
    const siguientesErrores: Record<string, string> = {};
    const documento = paciente.documento.trim();
    const nombres = paciente.nombres.trim();
    const apellidos = paciente.apellidos.trim();
    const celular = paciente.celular.trim();

    if (!documento) {
      siguientesErrores.documento = "El documento de identidad es obligatorio.";
    }

    if (!nombres) {
      siguientesErrores.nombres = "El nombre es obligatorio.";
    }

    if (!apellidos) {
      siguientesErrores.apellidos = "El apellido es obligatorio.";
    }

    if (!celular) {
      siguientesErrores.celular = "El celular es obligatorio.";
    }

    setErrores((actuales) => ({ ...actuales, ...siguientesErrores }));
    return Object.keys(siguientesErrores).length === 0;
  };

  // Cargar horas disponibles cuando cambia médico o fecha
  useEffect(() => {
    if (medicoId && fecha) {
      const cargarHoras = async () => {
        setCargandoHoras(true);
        const horas = await getHorasDisponibles(Number(medicoId), fecha);
        setHorasDisponibles(horas);
        setCargandoHoras(false);
      };
      cargarHoras();
    } else {
      setHorasDisponibles([]);
    }
  }, [medicoId, fecha]);

  const buscarPaciente = async (documento: string) => {
    if (!documento || documento.length < 5) {
      setPacienteExistente(null);
      return;
    }
    
    setBuscandoPaciente(true);
    const pacienteEncontrado = await buscarPacientePorDocumento(documento);
    
    if (pacienteEncontrado) {
      setPacienteExistente(pacienteEncontrado);
      setPaciente({
        nombres: pacienteEncontrado.nombres || "",
        apellidos: pacienteEncontrado.apellidos || "",
        documento: pacienteEncontrado.documento,
        celular: pacienteEncontrado.celular || "",
        email: pacienteEncontrado.email || "",
        genero: pacienteEncontrado.genero || "Otro",
        fechaNacimiento: pacienteEncontrado.fechaNacimiento || ""
      });
    } else {
      setPacienteExistente(null);
    }
    setBuscandoPaciente(false);
  };

  const handleConfirmar = async () => {
    const citaValida = validarPaso(1) && validarPaso(2) && validarPaso(3) && validarPaso(4);
    const pacienteValido = validarPaciente();

    if (!citaValida || !pacienteValido) {
      return;
    }

    setCargando(true);

    try {
      let pacienteId;

      const documentoLimpio = paciente.documento.trim();
      const existente = await buscarPacientePorDocumento(documentoLimpio);
      
      if (existente) {
        pacienteId = existente.id;
      } else {
        const nuevo = await crearPaciente({
          ...paciente,
          documento: documentoLimpio,
          nombres: paciente.nombres.trim(),
          apellidos: paciente.apellidos.trim(),
          celular: paciente.celular.trim(),
          email: paciente.email.trim() || undefined,
          fechaNacimiento: paciente.fechaNacimiento || undefined,
        });
        pacienteId = nuevo.id;
      }

      await crearCita({
        fecha,
        hora,
        pacienteId,
        medicoId: Number(medicoId),
        descripcion: `Cita agendada en línea - ${especialidad}`,
        estado: "AGENDADA"
      });

      alert("Cita agendada exitosamente. Recibirá un mensaje de confirmación.");

      setPaso(1);
      setEspecialidad("");
      setMedicoId("");
      setMedicoNombre("");
      setFecha("");
      setHora("");
      setPaciente({
        nombres: "",
        apellidos: "",
        documento: "",
        celular: "",
        email: "",
        genero: "Otro",
        fechaNacimiento: ""
      });
      setPacienteExistente(null);
      setErrores({});

    } catch (error) {
      console.error("Error al agendar cita:", error);
      alert("Error al agendar la cita. Por favor intente nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const avanzarPaso = () => {
    if (!validarPaso(paso)) {
      return;
    }
    setPaso(paso + 1);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Reserva en Línea</h2>
        <p>Agende su cita de forma rápida y sencilla</p>
      </div>

      <div className="stepper">
        {[
          { num: 1, label: "Especialidad" },
          { num: 2, label: "Médico" },
          { num: 3, label: "Fecha" },
          { num: 4, label: "Hora" },
          { num: 5, label: "Datos" }
        ].map((step) => (
          <div key={step.num} className={`step ${paso >= step.num ? "active" : ""}`}>
            <div className="step-circle">{step.num}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>

      {paso === 1 && (
        <div className="card-custom">
          <h4>Seleccione una especialidad</h4>
          {errores.especialidad && <div className="error-message form-error-summary">{errores.especialidad}</div>}
          <div className="options-grid">
            {ESPECIALIDADES.map(esp => (
              <button
                key={esp}
                className={`option-card ${especialidad === esp ? "selected" : ""}`}
                type="button"
                onClick={() => {
                  setEspecialidad(esp);
                  limpiarError("especialidad");
                }}
              >
                <strong>{esp}</strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="card-custom">
          <h4>Seleccione un especialista</h4>
          {errores.medicoId && <div className="error-message form-error-summary">{errores.medicoId}</div>}
          {medicosFiltrados.length > 0 ? (
            <div className="options-grid">
              {medicosFiltrados.map((doc: any) => (
                <button
                  key={doc.id}
                  className={`option-card ${medicoId === doc.id ? "selected" : ""}`}
                  type="button"
                  onClick={() => {
                    setMedicoId(doc.id);
                    setMedicoNombre(doc.nombre);
                    limpiarError("medicoId");
                  }}
                >
                  <strong>{doc.nombre}</strong>
                  <small>{doc.especialidad}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No hay especialistas disponibles para {especialidad}</p>
              <small>Por favor seleccione otra especialidad</small>
            </div>
          )}
        </div>
      )}

      {paso === 3 && (
        <div className="card-custom">
          <h4>Seleccione una fecha</h4>
          {errores.fecha && <div className="error-message form-error-summary">{errores.fecha}</div>}
          <input
            type="date"
            value={fecha}
            onChange={(e) => {
              setFecha(e.target.value);
              limpiarError("fecha");
            }}
            min={new Date().toISOString().split('T')[0]}
            className="date-input"
          />
          <small>Las citas se pueden agendar con hasta 4 semanas de anticipación</small>
        </div>
      )}

      {paso === 4 && (
        <div className="card-custom">
          <h4>Seleccione una hora</h4>
          {errores.hora && <div className="error-message form-error-summary">{errores.hora}</div>}
          {cargandoHoras ? (
            <p className="text-center">Cargando horarios disponibles...</p>
          ) : horasDisponibles.length > 0 ? (
            <div className="hours-grid">
              {horasDisponibles.map(h => (
                <button
                  key={h}
                  className={`hour-btn ${hora === h ? "selected" : ""}`}
                  type="button"
                  onClick={() => {
                    setHora(h);
                    limpiarError("hora");
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No hay horarios disponibles para esta fecha</p>
              <small>Seleccione otra fecha o verifique que el médico atiende este día</small>
            </div>
          )}
        </div>
      )}

      {paso === 5 && (
        <div className="card-custom">
          <h4>Datos personales</h4>
          {(errores.documento || errores.nombres || errores.apellidos || errores.celular) && (
            <div className="error-message form-error-summary">
              Complete los campos obligatorios marcados con * antes de confirmar la cita.
            </div>
          )}
          
          <div className="form-group">
            <label>Documento de identidad *</label>
            <input
              type="text"
              placeholder="Número de documento"
              value={paciente.documento}
              onChange={(e) => {
                setPaciente({...paciente, documento: e.target.value});
                limpiarError("documento");
                buscarPaciente(e.target.value);
              }}
              className={errores.documento ? "input-error" : ""}
              aria-invalid={Boolean(errores.documento)}
            />
            {errores.documento && <small className="error-message">{errores.documento}</small>}
          </div>

          {buscandoPaciente && <p className="text-center">Buscando paciente...</p>}

          {pacienteExistente && (
            <div className="success-message">
              <span>✓</span>
              <p>Paciente encontrado: {pacienteExistente.nombres} {pacienteExistente.apellidos}</p>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Nombres *</label>
              <input
                type="text"
                placeholder="Nombres"
                value={paciente.nombres}
                onChange={(e) => {
                  setPaciente({...paciente, nombres: e.target.value});
                  limpiarError("nombres");
                }}
                disabled={pacienteExistente !== null}
                className={errores.nombres ? "input-error" : ""}
                aria-invalid={Boolean(errores.nombres)}
              />
              {errores.nombres && <small className="error-message">{errores.nombres}</small>}
            </div>
            <div className="form-group">
              <label>Apellidos *</label>
              <input
                type="text"
                placeholder="Apellidos"
                value={paciente.apellidos}
                onChange={(e) => {
                  setPaciente({...paciente, apellidos: e.target.value});
                  limpiarError("apellidos");
                }}
                disabled={pacienteExistente !== null}
                className={errores.apellidos ? "input-error" : ""}
                aria-invalid={Boolean(errores.apellidos)}
              />
              {errores.apellidos && <small className="error-message">{errores.apellidos}</small>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Celular *</label>
              <input
                type="tel"
                placeholder="Celular"
                value={paciente.celular}
                onChange={(e) => {
                  setPaciente({...paciente, celular: e.target.value});
                  limpiarError("celular");
                }}
                disabled={pacienteExistente !== null}
                className={errores.celular ? "input-error" : ""}
                aria-invalid={Boolean(errores.celular)}
              />
              {errores.celular && <small className="error-message">{errores.celular}</small>}
            </div>
            <div className="form-group">
              <label>Género</label>
              <select
                value={paciente.genero}
                onChange={(e) => setPaciente({...paciente, genero: e.target.value as "Hombre" | "Mujer" | "Otro"})}
                disabled={pacienteExistente !== null}
              >
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <input
                type="date"
                value={paciente.fechaNacimiento}
                onChange={(e) => setPaciente({...paciente, fechaNacimiento: e.target.value})}
                disabled={pacienteExistente !== null}
              />
            </div>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={paciente.email}
                onChange={(e) => setPaciente({...paciente, email: e.target.value})}
                disabled={pacienteExistente !== null}
              />
            </div>
          </div>
          
          <div className="resumen-cita">
            <h4>Resumen de la cita</h4>
            <p><strong>Especialidad:</strong> {especialidad}</p>
            <p><strong>Médico:</strong> {medicoNombre}</p>
            <p><strong>Fecha:</strong> {fecha}</p>
            <p><strong>Hora:</strong> {hora}</p>
          </div>
        </div>
      )}

      <div className="step-buttons">
        {paso > 1 && (
          <button className="btn btn-secondary" onClick={() => setPaso(paso - 1)} disabled={cargando}>
            ← Anterior
          </button>
        )}
        {paso < 5 && (
          <button 
            className="btn btn-primary" 
            onClick={avanzarPaso}
            disabled={cargando}
          >
            Siguiente →
          </button>
        )}
        {paso === 5 && (
          <button 
            className="btn btn-success"
            onClick={handleConfirmar}
            disabled={cargando}
          >
            {cargando ? "Procesando..." : "Confirmar Cita"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AgendarWeb;