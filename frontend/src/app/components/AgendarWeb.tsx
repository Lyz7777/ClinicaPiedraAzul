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
    if (!documento || documento.length < 5) return;
    
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

  const registrarNuevoPaciente = async () => {
    if (!paciente.documento || !paciente.nombres || !paciente.apellidos || !paciente.celular) {
      alert("Por favor complete los campos obligatorios");
      return false;
    }

    const nuevoPaciente = await crearPaciente(paciente);
    setPacienteExistente(nuevoPaciente);
    return nuevoPaciente.id;
  };

  const handleConfirmar = async () => {
    if (!especialidad || !medicoId || !fecha || !hora) {
      alert("Por favor complete todos los datos de la cita");
      return;
    }

    if (!paciente.documento || !paciente.nombres || !paciente.apellidos || !paciente.celular) {
      alert("Por favor complete los datos personales");
      return;
    }

    setCargando(true);

    try {
      let pacienteId;

      const existente = await buscarPacientePorDocumento(paciente.documento);
      
      if (existente) {
        pacienteId = existente.id;
      } else {
        const nuevo = await crearPaciente(paciente);
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

      alert("✅ Cita agendada exitosamente. Recibirá un mensaje de confirmación.");

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

    } catch (error) {
      console.error("Error al agendar cita:", error);
      alert("❌ Error al agendar la cita. Por favor intente nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const avanzarPaso = () => {
    if (paso === 1 && !especialidad) {
      alert("Por favor seleccione una especialidad");
      return;
    }
    if (paso === 2 && !medicoId) {
      alert("Por favor seleccione un especialista");
      return;
    }
    if (paso === 3 && !fecha) {
      alert("Por favor seleccione una fecha");
      return;
    }
    if (paso === 4 && !hora) {
      alert("Por favor seleccione una hora");
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
          <div className="options-grid">
            {ESPECIALIDADES.map(esp => (
              <button
                key={esp}
                className={`option-card ${especialidad === esp ? "selected" : ""}`}
                onClick={() => setEspecialidad(esp)}
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
          {medicosFiltrados.length > 0 ? (
            <div className="options-grid">
              {medicosFiltrados.map((doc: any) => (
                <button
                  key={doc.id}
                  className={`option-card ${medicoId === doc.id ? "selected" : ""}`}
                  onClick={() => {
                    setMedicoId(doc.id);
                    setMedicoNombre(doc.nombre);
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
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="date-input"
          />
          <small>Las citas se pueden agendar con hasta 4 semanas de anticipación</small>
        </div>
      )}

      {paso === 4 && (
        <div className="card-custom">
          <h4>Seleccione una hora</h4>
          {cargandoHoras ? (
            <p className="text-center">Cargando horarios disponibles...</p>
          ) : horasDisponibles.length > 0 ? (
            <div className="hours-grid">
              {horasDisponibles.map(h => (
                <button
                  key={h}
                  className={`hour-btn ${hora === h ? "selected" : ""}`}
                  onClick={() => setHora(h)}
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
          
          <div className="form-group">
            <label>Documento de identidad *</label>
            <input
              type="text"
              placeholder="Número de documento"
              value={paciente.documento}
              onChange={(e) => {
                setPaciente({...paciente, documento: e.target.value});
                buscarPaciente(e.target.value);
              }}
            />
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
                onChange={(e) => setPaciente({...paciente, nombres: e.target.value})}
                disabled={pacienteExistente !== null}
              />
            </div>
            <div className="form-group">
              <label>Apellidos *</label>
              <input
                type="text"
                placeholder="Apellidos"
                value={paciente.apellidos}
                onChange={(e) => setPaciente({...paciente, apellidos: e.target.value})}
                disabled={pacienteExistente !== null}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Celular *</label>
              <input
                type="tel"
                placeholder="Celular"
                value={paciente.celular}
                onChange={(e) => setPaciente({...paciente, celular: e.target.value})}
                disabled={pacienteExistente !== null}
              />
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
            disabled={
              (paso === 1 && !especialidad) || 
              (paso === 2 && !medicoId) || 
              (paso === 3 && !fecha) || 
              (paso === 4 && !hora) ||
              cargando
            }
          >
            Siguiente →
          </button>
        )}
        {paso === 5 && (
          <button 
            className="btn btn-success"
            onClick={handleConfirmar}
            disabled={
              !paciente.documento || 
              !paciente.nombres || 
              !paciente.apellidos || 
              !paciente.celular ||
              cargando
            }
          >
            {cargando ? "Procesando..." : "Confirmar Cita"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AgendarWeb;